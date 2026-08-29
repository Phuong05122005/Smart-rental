import prisma from './prisma';

export const logAudit = async (
  actor_id: string | null,
  action: string,
  target_type: string,
  target_id: string,
  old_value: any = null,
  new_value: any = null
) => {
  try {
    await prisma.auditLog.create({
      data: {
        actor_id,
        action,
        target_type,
        target_id,
        old_value: old_value ? JSON.stringify(old_value) : null,
        new_value: new_value ? JSON.stringify(new_value) : null,
      }
    });
  } catch (error) {
    console.error('[Audit Log Error]', error);
  }
};
