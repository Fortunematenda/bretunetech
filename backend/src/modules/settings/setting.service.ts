import prisma from '../../lib/prisma';

interface UpsertSettingInput {
  key: string;
  value: string;
  group?: string;
  description?: string;
  isPublic?: boolean;
}

export class SettingService {
  async list() {
    return prisma.setting.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
  }

  async getPublic() {
    return prisma.setting.findMany({
      where: { isPublic: true },
      select: { key: true, value: true, group: true },
    });
  }

  async getByKey(key: string) {
    return prisma.setting.findUnique({
      where: { key },
    });
  }

  async upsert(data: UpsertSettingInput) {
    return prisma.setting.upsert({
      where: { key: data.key },
      update: {
        value: data.value,
        group: data.group,
        description: data.description,
        isPublic: data.isPublic,
      },
      create: {
        key: data.key,
        value: data.value,
        group: data.group || 'general',
        description: data.description,
        isPublic: data.isPublic || false,
      },
    });
  }

  async update(key: string, value: string) {
    return prisma.setting.update({
      where: { key },
      data: { value },
    });
  }

  async delete(key: string) {
    return prisma.setting.delete({
      where: { key },
    });
  }

  async getByGroup(group: string) {
    return prisma.setting.findMany({
      where: { group },
      orderBy: { key: 'asc' },
    });
  }

  // Seed default settings
  async seedDefaults() {
    const defaults = [
      { key: 'business_name', value: 'Bretune Technologies', group: 'general', isPublic: true },
      { key: 'business_email', value: 'sales@bretune.co.za', group: 'general', isPublic: true },
      { key: 'business_phone', value: '+27 21 555 0184', group: 'general', isPublic: true },
      { key: 'business_address', value: 'Cape Town, South Africa', group: 'general', isPublic: true },
      { key: 'vat_number', value: '', group: 'general', isPublic: false },
      { key: 'vat_rate', value: '0', group: 'general', isPublic: true, description: 'VAT rate as decimal (0% = not VAT registered)' },
      { key: 'currency', value: 'ZAR', group: 'general', isPublic: true },
      { key: 'payment_methods', value: 'EFT,PayFast,Yoco', group: 'payments', isPublic: true },
      { key: 'free_shipping_threshold', value: '1000', group: 'shipping', isPublic: true, description: 'Free shipping for orders over this amount' },
      { key: 'enable_whatsapp_checkout', value: 'true', group: 'payments', isPublic: false },
      { key: 'enable_payfast', value: 'false', group: 'payments', isPublic: true },
      { key: 'enable_yoco', value: 'false', group: 'payments', isPublic: true },
      { key: 'announcements', value: JSON.stringify([
        { icon: 'truck', text: '🚚 Free Delivery Over R2000' },
        { icon: 'clock', text: '⚡ Same Day Cape Town Dispatch' },
        { icon: 'headphones', text: '📞 24/7 Enterprise Support' },
      ]), group: 'general', isPublic: true, description: 'Announcement banner items' },
    ];

    for (const setting of defaults) {
      await this.upsert(setting);
    }

    return { seeded: defaults.length };
  }
}
