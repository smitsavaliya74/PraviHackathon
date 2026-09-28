import { PrismaClient, Role, AssetCategory, AssetStatus, AssetCondition } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { computeAuditHash } from '../src/utils/hash';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AssetTrust database...\n');

  // ─── Location Hierarchy ─────────────────────────────────
  const india = await prisma.country.upsert({
    where: { code: 'IN' },
    update: {},
    create: { name: 'India', code: 'IN' },
  });

  const gujarat = await prisma.state.upsert({
    where: { countryId_code: { countryId: india.id, code: 'GJ' } },
    update: {},
    create: { name: 'Gujarat', code: 'GJ', countryId: india.id },
  });

  const surat = await prisma.district.upsert({
    where: { stateId_code: { stateId: gujarat.id, code: 'SUR' } },
    update: {},
    create: { name: 'Surat', code: 'SUR', stateId: gujarat.id },
  });

  const ahmedabad = await prisma.district.upsert({
    where: { stateId_code: { stateId: gujarat.id, code: 'AMD' } },
    update: {},
    create: { name: 'Ahmedabad', code: 'AMD', stateId: gujarat.id },
  });

  console.log('✅ Locations seeded');

  // ─── Departments ──────────────────────────────────────
  const pwd = await prisma.department.upsert({
    where: { code: 'PWD' },
    update: {},
    create: { name: 'Public Works Department', code: 'PWD', districtId: surat.id },
  });

  const elec = await prisma.department.upsert({
    where: { code: 'ELEC' },
    update: {},
    create: { name: 'Electricity Department', code: 'ELEC', districtId: surat.id },
  });

  const water = await prisma.department.upsert({
    where: { code: 'WATER' },
    update: {},
    create: { name: 'Water Supply Department', code: 'WATER', districtId: ahmedabad.id },
  });

  console.log('✅ Departments seeded');

  // ─── Users ────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const deptAdminHash = await bcrypt.hash('DeptAdmin@123', 12);
  const officerHash = await bcrypt.hash('Officer@123', 12);
  const auditorHash = await bcrypt.hash('Auditor@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@assettrust.gov.in' },
    update: {},
    create: {
      email: 'admin@assettrust.gov.in',
      passwordHash,
      name: 'Super Administrator',
      role: Role.SUPER_ADMIN,
      phone: '+91-9876543210',
    },
  });

  const deptAdmin = await prisma.user.upsert({
    where: { email: 'deptadmin@assettrust.gov.in' },
    update: {},
    create: {
      email: 'deptadmin@assettrust.gov.in',
      passwordHash: deptAdminHash,
      name: 'Rajesh Kumar',
      role: Role.DEPT_ADMIN,
      departmentId: pwd.id,
      phone: '+91-9876543211',
    },
  });

  const officer = await prisma.user.upsert({
    where: { email: 'officer@assettrust.gov.in' },
    update: {},
    create: {
      email: 'officer@assettrust.gov.in',
      passwordHash: officerHash,
      name: 'Priya Sharma',
      role: Role.FIELD_OFFICER,
      departmentId: pwd.id,
      phone: '+91-9876543212',
    },
  });

  const auditor = await prisma.user.upsert({
    where: { email: 'auditor@assettrust.gov.in' },
    update: {},
    create: {
      email: 'auditor@assettrust.gov.in',
      passwordHash: auditorHash,
      name: 'Amit Patel',
      role: Role.AUDITOR,
      phone: '+91-9876543213',
    },
  });

  console.log('✅ Users seeded');

  // ─── Assets ───────────────────────────────────────────
  const assetData: Array<{
    assetId: string;
    name: string;
    category: AssetCategory;
    status: AssetStatus;
    condition: AssetCondition;
    lat: number;
    lng: number;
    departmentId: string;
    purchaseCost: number;
    currentValue: number;
    healthScore: number;
    address: string;
  }> = [
    { assetId: 'GJ-SUR-BRG-00001', name: 'Tapi River Bridge #1', category: 'BRIDGE', status: 'IN_USE', condition: 'GOOD', lat: 21.1702, lng: 72.8311, departmentId: pwd.id, purchaseCost: 50000000, currentValue: 42000000, healthScore: 82, address: 'NH-48, Surat, Gujarat' },
    { assetId: 'GJ-SUR-RD-00002', name: 'Ring Road Segment A', category: 'ROAD', status: 'IN_USE', condition: 'FAIR', lat: 21.1959, lng: 72.8302, departmentId: pwd.id, purchaseCost: 15000000, currentValue: 12000000, healthScore: 65, address: 'Ring Road, Adajan, Surat' },
    { assetId: 'GJ-SUR-BLD-00003', name: 'District Collector Office', category: 'BUILDING', status: 'IN_USE', condition: 'EXCELLENT', lat: 21.1869, lng: 72.8296, departmentId: pwd.id, purchaseCost: 80000000, currentValue: 75000000, healthScore: 95, address: 'Chowk Bazaar, Surat' },
    { assetId: 'GJ-SUR-TRF-00004', name: 'Transformer Adajan-01', category: 'TRANSFORMER', status: 'IN_USE', condition: 'GOOD', lat: 21.1852, lng: 72.8106, departmentId: elec.id, purchaseCost: 2500000, currentValue: 2000000, healthScore: 78, address: 'Adajan Gam, Surat' },
    { assetId: 'GJ-SUR-TRF-00005', name: 'Transformer Vesu-02', category: 'TRANSFORMER', status: 'UNDER_MAINTENANCE', condition: 'POOR', lat: 21.1573, lng: 72.7749, departmentId: elec.id, purchaseCost: 2800000, currentValue: 1500000, healthScore: 35, address: 'Vesu, Surat' },
    { assetId: 'GJ-SUR-SL-00006', name: 'Streetlight Cluster Athwa', category: 'STREETLIGHT', status: 'IN_USE', condition: 'GOOD', lat: 21.1782, lng: 72.8124, departmentId: elec.id, purchaseCost: 500000, currentValue: 350000, healthScore: 72, address: 'Athwa Lines, Surat' },
    { assetId: 'GJ-AMD-WP-00007', name: 'Water Pump Station Maninagar', category: 'WATER_PUMP', status: 'IN_USE', condition: 'FAIR', lat: 23.0019, lng: 72.6039, departmentId: water.id, purchaseCost: 8000000, currentValue: 6500000, healthScore: 61, address: 'Maninagar, Ahmedabad' },
    { assetId: 'GJ-AMD-WP-00008', name: 'Water Pump Station Navrangpura', category: 'WATER_PUMP', status: 'IN_USE', condition: 'GOOD', lat: 23.0354, lng: 72.5608, departmentId: water.id, purchaseCost: 9000000, currentValue: 7800000, healthScore: 84, address: 'Navrangpura, Ahmedabad' },
    { assetId: 'GJ-SUR-VH-00009', name: 'Inspection Vehicle GJ-05-AB-1234', category: 'VEHICLE', status: 'IN_USE', condition: 'GOOD', lat: 21.1702, lng: 72.8311, departmentId: pwd.id, purchaseCost: 1200000, currentValue: 800000, healthScore: 70, address: 'PWD Office Yard, Surat' },
    { assetId: 'GJ-SUR-IT-00010', name: 'Server Rack Unit #1', category: 'IT_EQUIPMENT', status: 'IN_USE', condition: 'EXCELLENT', lat: 21.1869, lng: 72.8296, departmentId: pwd.id, purchaseCost: 500000, currentValue: 350000, healthScore: 90, address: 'DC Office, Surat' },
    { assetId: 'GJ-SUR-BRG-00011', name: 'Hazira Industrial Bridge', category: 'BRIDGE', status: 'PLANNED', condition: 'GOOD', lat: 21.1000, lng: 72.6500, departmentId: pwd.id, purchaseCost: 120000000, currentValue: 120000000, healthScore: 100, address: 'Hazira, Surat' },
    { assetId: 'GJ-SUR-RD-00012', name: 'Dumas Beach Road', category: 'ROAD', status: 'IN_USE', condition: 'POOR', lat: 21.0829, lng: 72.7141, departmentId: pwd.id, purchaseCost: 8000000, currentValue: 4500000, healthScore: 42, address: 'Dumas Road, Surat' },
    { assetId: 'GJ-SUR-BLD-00013', name: 'Community Health Center', category: 'BUILDING', status: 'IN_USE', condition: 'FAIR', lat: 21.2049, lng: 72.8409, departmentId: pwd.id, purchaseCost: 25000000, currentValue: 20000000, healthScore: 58, address: 'Udhna, Surat' },
    { assetId: 'GJ-SUR-TRF-00014', name: 'Transformer Katargam-03', category: 'TRANSFORMER', status: 'IN_USE', condition: 'CRITICAL', lat: 21.2119, lng: 72.8465, departmentId: elec.id, purchaseCost: 3000000, currentValue: 800000, healthScore: 18, address: 'Katargam, Surat' },
    { assetId: 'GJ-SUR-SL-00015', name: 'Streetlight Cluster Ring Road', category: 'STREETLIGHT', status: 'RETIRED', condition: 'POOR', lat: 21.2055, lng: 72.8302, departmentId: elec.id, purchaseCost: 600000, currentValue: 50000, healthScore: 10, address: 'Ring Road, Surat' },
  ];

  for (const a of assetData) {
    await prisma.asset.upsert({
      where: { assetId: a.assetId },
      update: {},
      create: {
        assetId: a.assetId,
        name: a.name,
        category: a.category,
        status: a.status,
        condition: a.condition,
        latitude: a.lat,
        longitude: a.lng,
        departmentId: a.departmentId,
        createdById: admin.id,
        purchaseCost: a.purchaseCost,
        currentValue: a.currentValue,
        healthScore: a.healthScore,
        address: a.address,
        purchaseDate: new Date('2022-01-15'),
        warrantyExpiry: new Date('2032-01-15'),
        photos: [],
        documents: [],
        photoHashes: [],
      },
    });
  }

  console.log(`✅ ${assetData.length} Assets seeded`);

  // ─── Audit Log Genesis Entry ──────────────────────────
  const genesisHash = computeAuditHash({
    prevHash: null,
    action: 'SYSTEM_INIT',
    entityType: 'System',
    entityId: null,
    before: null,
    after: { event: 'Database seeded', version: '1.0.0' },
    timestamp: new Date().toISOString(),
  });

  await prisma.auditLog.upsert({
    where: { sequence: 1 },
    update: {},
    create: {
      action: 'SYSTEM_INIT',
      entityType: 'System',
      entityId: null,
      after: { event: 'Database seeded', version: '1.0.0' },
      prevHash: null,
      hash: genesisHash,
    },
  });

  console.log('✅ Audit log genesis entry created');

  console.log('\n🎉 Seed complete!\n');
  console.log('Login credentials:');
  console.log('  SUPER_ADMIN  : admin@assettrust.gov.in / Admin@123');
  console.log('  DEPT_ADMIN   : deptadmin@assettrust.gov.in / DeptAdmin@123');
  console.log('  FIELD_OFFICER: officer@assettrust.gov.in / Officer@123');
  console.log('  AUDITOR      : auditor@assettrust.gov.in / Auditor@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
