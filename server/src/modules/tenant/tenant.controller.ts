import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middleware/errorHandler';

/**
 * @route   GET /api/v1/tenant/context
 * @desc    Retrieves current tenant profile and recent audit logs from their isolated database.
 *          Auto-provisions a default profile if this is the tenant's first access.
 * @access  Protected (requireAuthAndTenant + attachTenantDb)
 */
export const getTenantContextHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.auth || !req.tenantDb) {
    return next(new AppError('Tenant database context not available', 500, 'CONTEXT_ERROR'));
  }

  const { tenantId, tenantName, email } = req.auth;
  const { models, dbName } = req.tenantDb;

  try {
    let profile = await models.TenantProfile.findOne({ tenantId });

    if (!profile) {
      // Auto-provision initial tenant profile in this isolated database
      profile = await models.TenantProfile.create({
        tenantId,
        organizationName: tenantName,
        plan: 'ENTERPRISE',
        isolationZone: `enclave-${tenantId}`,
        status: 'ACTIVE',
        monthlyQuotaUsd: 250000,
      });

      // Record immutable provisioning audit log in the isolated database
      await models.TenantAuditLog.create({
        action: 'TENANT_AUTO_PROVISIONED',
        actorEmail: email,
        tenantId,
        metadata: {
          initialPlan: 'ENTERPRISE',
          databaseName: dbName,
          isolationZone: `enclave-${tenantId}`,
        },
      });
    }

    const recentAuditLogs = await models.TenantAuditLog.find({ tenantId })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        databaseName: dbName,
        profile,
        recentAuditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/v1/tenant/profile
 * @desc    Updates configuration parameters inside the tenant's isolated database.
 * @access  Protected (requireAuthAndTenant + attachTenantDb)
 */
export const updateTenantProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.auth || !req.tenantDb) {
    return next(new AppError('Tenant database context not available', 500, 'CONTEXT_ERROR'));
  }

  const { tenantId, email } = req.auth;
  const { models } = req.tenantDb;
  const { monthlyQuotaUsd, isolationZone } = req.body;

  const updates: Record<string, any> = {};

  if (monthlyQuotaUsd !== undefined) {
    if (typeof monthlyQuotaUsd !== 'number' || monthlyQuotaUsd < 0) {
      return next(
        new AppError('monthlyQuotaUsd must be a non-negative number', 400, 'VALIDATION_ERROR')
      );
    }
    updates.monthlyQuotaUsd = monthlyQuotaUsd;
  }

  if (isolationZone !== undefined) {
    if (typeof isolationZone !== 'string' || !isolationZone.trim()) {
      return next(
        new AppError('isolationZone must be a non-empty string', 400, 'VALIDATION_ERROR')
      );
    }
    updates.isolationZone = isolationZone.trim();
  }

  if (Object.keys(updates).length === 0) {
    return next(
      new AppError(
        'At least one valid field (monthlyQuotaUsd, isolationZone) must be provided for update',
        400,
        'VALIDATION_ERROR'
      )
    );
  }

  try {
    const profile = await models.TenantProfile.findOneAndUpdate(
      { tenantId },
      { $set: updates },
      { new: true, upsert: true }
    );

    await models.TenantAuditLog.create({
      action: 'TENANT_PROFILE_UPDATED',
      actorEmail: email,
      tenantId,
      metadata: {
        updatedFields: updates,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};
