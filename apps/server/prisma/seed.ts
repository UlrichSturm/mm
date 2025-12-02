import {
  LawyerNotaryStatus,
  LicenseType,
  OrderStatus,
  PaymentStatus,
  PrismaClient,
  Role,
  ServiceStatus,
  VendorStatus,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// Note: Passwords are managed by Keycloak, not stored in database
// Users must be created in Keycloak separately

async function main() {
  console.log('🌱 Starting seed...\n');

  // Clean database (only in development)
  if (process.env.NODE_ENV !== 'production') {
    await cleanDatabase();
  }

  // Seed data in order
  await seedCategories();
  const users = await seedUsers();
  await seedVendorProfiles(users.vendors);
  await seedLawyerNotaryProfiles(users.lawyersNotaries);
  await seedServices();
  await seedOrders(users.clients);

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📋 Test credentials:');
  console.log('   Admin: admin@mementomori.de / password123');
  console.log('   Client: client1@test.com / password123');
  console.log('   Vendor: vendor1@test.com / password123');
  console.log('   Lawyer: lawyer1@test.com / password123');
}

async function cleanDatabase() {
  console.log('🧹 Cleaning database...');

  // Delete in order respecting foreign keys
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.service.deleteMany();
  await prisma.lawyerNotaryProfile.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('   ✓ Database cleaned\n');
}

async function seedCategories() {
  console.log('📁 Seeding categories...');

  const categories = [
    {
      name: 'Funeral Services',
      slug: 'funeral-services',
      description: 'Complete funeral organization and ceremony services',
      icon: 'funeral',
      sortOrder: 1,
    },
    {
      name: 'Transportation',
      slug: 'transportation',
      description: 'Hearse and transportation services',
      icon: 'transport',
      sortOrder: 2,
    },
    {
      name: 'Legal Services',
      slug: 'legal-services',
      description: 'Legal assistance, wills, and inheritance matters',
      icon: 'legal',
      sortOrder: 3,
    },
    {
      name: 'Monuments & Gravestones',
      slug: 'monuments',
      description: 'Design and installation of monuments and gravestones',
      icon: 'monument',
      sortOrder: 4,
    },
    {
      name: 'Flowers & Wreaths',
      slug: 'flowers',
      description: 'Funeral flowers, wreaths, and floral arrangements',
      icon: 'flowers',
      sortOrder: 5,
    },
    {
      name: 'Cremation',
      slug: 'cremation',
      description: 'Cremation services and urn selection',
      icon: 'cremation',
      sortOrder: 6,
    },
    {
      name: 'Memorial Services',
      slug: 'memorial',
      description: 'Memorial ceremonies and celebration of life services',
      icon: 'memorial',
      sortOrder: 7,
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`   ✓ ${category.name}`);
  }
}

interface SeedUsers {
  admin: { id: string; email: string };
  clients: { id: string; email: string }[];
  vendors: { id: string; email: string; firstName: string; lastName: string }[];
  lawyersNotaries: { id: string; email: string; firstName: string; lastName: string }[];
}

async function seedUsers(): Promise<SeedUsers> {
  console.log('\n👥 Seeding users...');

  // Password is empty - users must be created in Keycloak
  const emptyPassword = '';

  // Fixed IDs to match Keycloak
  const adminId = 'e0db99c9-7e8d-4bd9-b163-854b2ce12d76';
  const client1Id = 'c637ea3b-a621-49a1-b44f-5bb26c580078';
  const vendor1Id = '13d441ed-bd32-40d7-8603-8ab7b02dcde2';
  const lawyer1Id = '9ec4de0b-5d47-4c3c-b272-b850886914ee';

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mementomori.de' },
    update: {},
    create: {
      id: adminId,
      email: 'admin@mementomori.de',
      password: emptyPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+49 30 1234567',
      role: Role.ADMIN,
    },
  });
  console.log(`   ✓ Admin: ${admin.email}`);

  // Client users
  const clientsData = [
    {
      id: client1Id,
      email: 'client1@test.com',
      firstName: 'Hans',
      lastName: 'Mueller',
      phone: '+49 30 1111111',
    },
    {
      id: undefined,
      email: 'client2@test.com',
      firstName: 'Anna',
      lastName: 'Schmidt',
      phone: '+49 30 2222222',
    },
    {
      id: undefined,
      email: 'client3@test.com',
      firstName: 'Klaus',
      lastName: 'Weber',
      phone: '+49 30 3333333',
    },
    {
      id: undefined,
      email: 'client4@test.com',
      firstName: 'Maria',
      lastName: 'Fischer',
      phone: '+49 30 4444444',
    },
  ];

  const clients: { id: string; email: string }[] = [];
  for (const data of clientsData) {
    const client = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        id: data.id, // Will be auto-generated if undefined
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: emptyPassword,
        role: Role.CLIENT,
      },
    });
    clients.push({ id: client.id, email: client.email });
    console.log(`   ✓ Client: ${client.email}`);
  }

  // Vendor users
  const vendorsData = [
    {
      id: vendor1Id,
      email: 'vendor1@test.com',
      firstName: 'Peter',
      lastName: 'Becker',
      phone: '+49 30 5551111',
    },
    {
      id: undefined,
      email: 'vendor2@test.com',
      firstName: 'Elena',
      lastName: 'Hoffmann',
      phone: '+49 30 5552222',
    },
    {
      id: undefined,
      email: 'vendor3@test.com',
      firstName: 'Stefan',
      lastName: 'Wolf',
      phone: '+49 30 5553333',
    },
    {
      id: undefined,
      email: 'vendor4@test.com',
      firstName: 'Lisa',
      lastName: 'Koch',
      phone: '+49 30 5554444',
    },
  ];

  const vendors: { id: string; email: string; firstName: string; lastName: string }[] = [];
  for (const data of vendorsData) {
    const vendor = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: emptyPassword,
        role: Role.VENDOR,
      },
    });
    vendors.push({
      id: vendor.id,
      email: vendor.email,
      firstName: data.firstName,
      lastName: data.lastName,
    });
    console.log(`   ✓ Vendor: ${vendor.email}`);
  }

  // Lawyer/Notary users
  const lawyersData = [
    {
      id: lawyer1Id,
      email: 'lawyer1@test.com',
      firstName: 'Friedrich',
      lastName: 'Richter',
      phone: '+49 30 6661111',
    },
    {
      id: undefined,
      email: 'notary1@test.com',
      firstName: 'Sabine',
      lastName: 'Braun',
      phone: '+49 30 6662222',
    },
  ];

  const lawyersNotaries: { id: string; email: string; firstName: string; lastName: string }[] = [];
  for (const data of lawyersData) {
    const lawyer = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: emptyPassword,
        role: Role.LAWYER_NOTARY,
      },
    });
    lawyersNotaries.push({
      id: lawyer.id,
      email: lawyer.email,
      firstName: data.firstName,
      lastName: data.lastName,
    });
    console.log(`   ✓ Lawyer/Notary: ${lawyer.email}`);
  }

  return { admin: { id: admin.id, email: admin.email }, clients, vendors, lawyersNotaries };
}

async function seedVendorProfiles(
  vendors: { id: string; email: string; firstName: string; lastName: string }[],
) {
  console.log('\n🏪 Seeding vendor profiles...');

  const profilesData = [
    {
      email: 'vendor1@test.com',
      businessName: 'Bestattungen Becker GmbH',
      description:
        'Family-owned funeral home serving Berlin since 1952. We provide compassionate and professional funeral services.',
      contactEmail: 'info@becker-bestattungen.de',
      contactPhone: '+49 30 5551111',
      website: 'https://becker-bestattungen.de',
      address: 'Friedrichstraße 123',
      city: 'Berlin',
      postalCode: '10117',
      latitude: 52.52,
      longitude: 13.405,
      status: VendorStatus.APPROVED,
      verifiedAt: new Date('2024-01-15'),
      rating: 4.8,
      reviewCount: 156,
    },
    {
      email: 'vendor2@test.com',
      businessName: 'Hoffmann Blumen & Kränze',
      description:
        'Specialized in funeral flowers and wreaths. Creating beautiful floral tributes with care and attention.',
      contactEmail: 'kontakt@hoffmann-blumen.de',
      contactPhone: '+49 30 5552222',
      address: 'Rosenstraße 45',
      city: 'Berlin',
      postalCode: '10178',
      latitude: 52.517,
      longitude: 13.4,
      status: VendorStatus.APPROVED,
      verifiedAt: new Date('2024-02-20'),
      rating: 4.6,
      reviewCount: 89,
    },
    {
      email: 'vendor3@test.com',
      businessName: 'Wolf Transport Services',
      description: 'Professional hearse and funeral transportation services throughout Germany.',
      contactEmail: 'transport@wolf-services.de',
      contactPhone: '+49 30 5553333',
      address: 'Industriestraße 78',
      city: 'Berlin',
      postalCode: '12099',
      latitude: 52.48,
      longitude: 13.42,
      status: VendorStatus.APPROVED,
      verifiedAt: new Date('2024-03-10'),
      rating: 4.9,
      reviewCount: 234,
    },
    {
      email: 'vendor4@test.com',
      businessName: 'Koch Steinmetz Meisterbetrieb',
      description: 'Master stonemason crafting beautiful monuments and gravestones.',
      contactEmail: 'info@koch-steinmetz.de',
      contactPhone: '+49 30 5554444',
      address: 'Steinweg 12',
      city: 'Berlin',
      postalCode: '13355',
      status: VendorStatus.PENDING,
      rating: 0,
      reviewCount: 0,
    },
  ];

  for (const data of profilesData) {
    const vendor = vendors.find(v => v.email === data.email);
    if (!vendor) {
      continue;
    }

    await prisma.vendorProfile.upsert({
      where: { userId: vendor.id },
      update: {},
      create: {
        userId: vendor.id,
        businessName: data.businessName,
        description: data.description,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        website: data.website,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        status: data.status,
        verifiedAt: data.verifiedAt,
        rating: data.rating,
        reviewCount: data.reviewCount,
      },
    });
    console.log(`   ✓ ${data.businessName} (${data.status})`);
  }
}

async function seedLawyerNotaryProfiles(
  lawyers: { id: string; email: string; firstName: string; lastName: string }[],
) {
  console.log('\n⚖️ Seeding lawyer/notary profiles...');

  const profilesData = [
    {
      email: 'lawyer1@test.com',
      licenseNumber: 'RAK-BLN-12345',
      licenseType: LicenseType.LAWYER,
      organizationName: 'Kanzlei Richter & Partner',
      specialization: 'Inheritance Law, Estate Planning',
      yearsOfExperience: 15,
      address: 'Kurfürstendamm 200',
      city: 'Berlin',
      postalCode: '10719',
      homeVisitAvailable: true,
      maxTravelRadius: 50,
      status: LawyerNotaryStatus.APPROVED,
      verifiedAt: new Date('2024-01-10'),
      rating: 4.7,
      reviewCount: 78,
    },
    {
      email: 'notary1@test.com',
      licenseNumber: 'NOT-BLN-67890',
      licenseType: LicenseType.NOTARY,
      organizationName: 'Notariat Braun',
      specialization: 'Wills, Power of Attorney, Property Transfers',
      yearsOfExperience: 20,
      address: 'Unter den Linden 50',
      city: 'Berlin',
      postalCode: '10117',
      homeVisitAvailable: true,
      maxTravelRadius: 30,
      status: LawyerNotaryStatus.APPROVED,
      verifiedAt: new Date('2024-02-05'),
      rating: 4.9,
      reviewCount: 145,
    },
  ];

  for (const data of profilesData) {
    const lawyer = lawyers.find(l => l.email === data.email);
    if (!lawyer) {
      continue;
    }

    await prisma.lawyerNotaryProfile.upsert({
      where: { userId: lawyer.id },
      update: {},
      create: {
        userId: lawyer.id,
        licenseNumber: data.licenseNumber,
        licenseType: data.licenseType,
        organizationName: data.organizationName,
        specialization: data.specialization,
        yearsOfExperience: data.yearsOfExperience,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        homeVisitAvailable: data.homeVisitAvailable,
        maxTravelRadius: data.maxTravelRadius,
        status: data.status,
        verifiedAt: data.verifiedAt,
        rating: data.rating,
        reviewCount: data.reviewCount,
      },
    });
    console.log(`   ✓ ${data.organizationName} (${data.licenseType})`);
  }
}

async function seedServices() {
  console.log('\n📦 Seeding services...');

  const vendors = await prisma.vendorProfile.findMany({
    where: { status: VendorStatus.APPROVED },
    include: { user: true },
  });

  const categories = await prisma.category.findMany();

  const servicesData = [
    {
      vendorEmail: 'vendor1@test.com',
      categorySlug: 'funeral-services',
      services: [
        {
          name: 'Complete Funeral Package',
          description:
            'Full-service funeral including coffin, ceremony organization, transportation, and documentation handling.',
          price: 4500,
          duration: 480,
        },
        {
          name: 'Cremation Service',
          description: 'Complete cremation service with urn and ceremony.',
          price: 2800,
          duration: 240,
        },
        {
          name: 'Basic Funeral Service',
          description: 'Essential funeral services at an affordable price.',
          price: 1800,
          duration: 180,
        },
        {
          name: 'Memorial Service',
          description: 'Dignified memorial ceremony with personalized touches.',
          price: 1200,
          duration: 120,
        },
      ],
    },
    {
      vendorEmail: 'vendor2@test.com',
      categorySlug: 'flowers',
      services: [
        {
          name: 'Premium Funeral Wreath',
          description: 'Large elegant wreath with roses, lilies, and seasonal flowers.',
          price: 250,
        },
        {
          name: 'Standing Spray',
          description: 'Beautiful standing flower arrangement for the ceremony.',
          price: 180,
        },
        {
          name: 'Casket Spray',
          description: 'Elegant floral arrangement to adorn the casket.',
          price: 350,
        },
        {
          name: 'Sympathy Bouquet',
          description: 'Thoughtful bouquet to express condolences.',
          price: 65,
        },
      ],
    },
    {
      vendorEmail: 'vendor3@test.com',
      categorySlug: 'transportation',
      services: [
        {
          name: 'Hearse Service - Full Day',
          description: 'Mercedes hearse with professional driver for the entire day.',
          price: 800,
          duration: 480,
        },
        {
          name: 'Local Transport',
          description: 'Transport within city limits (up to 50km).',
          price: 350,
          duration: 120,
        },
        {
          name: 'Long Distance Transport',
          description: 'Interstate or international repatriation service. Price per 100km.',
          price: 150,
        },
        {
          name: 'Family Limousine',
          description: 'Luxury vehicle for family members during the funeral.',
          price: 400,
          duration: 300,
        },
      ],
    },
  ];

  for (const vendorServices of servicesData) {
    const vendor = vendors.find(v => v.user.email === vendorServices.vendorEmail);
    const category = categories.find(c => c.slug === vendorServices.categorySlug);

    if (!vendor || !category) {
      continue;
    }

    for (const service of vendorServices.services) {
      await prisma.service.create({
        data: {
          vendorId: vendor.id,
          categoryId: category.id,
          name: service.name,
          description: service.description,
          price: new Decimal(service.price),
          currency: 'EUR',
          duration: service.duration,
          status: ServiceStatus.ACTIVE,
          images: [],
        },
      });
      console.log(`   ✓ ${service.name} (€${service.price})`);
    }
  }
}

async function seedOrders(clients: { id: string; email: string }[]) {
  console.log('\n🛒 Seeding orders...');

  const services = await prisma.service.findMany({
    where: { status: ServiceStatus.ACTIVE },
  });

  if (clients.length === 0 || services.length === 0) {
    console.log('   ⚠ Skipping orders (no clients or services)');
    return;
  }

  const orderStatuses = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.IN_PROGRESS,
    OrderStatus.COMPLETED,
  ];

  let orderCount = 1;

  for (const client of clients.slice(0, 3)) {
    for (let i = 0; i < 2; i++) {
      const orderNumber = `MM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(orderCount++).padStart(4, '0')}`;
      const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];

      // Select 1-3 random services for this order
      const numItems = Math.floor(Math.random() * 3) + 1;
      const selectedServices = services.sort(() => Math.random() - 0.5).slice(0, numItems);

      // Calculate totals
      let subtotal = new Decimal(0);
      const orderItems: {
        serviceId: string;
        serviceName: string;
        servicePrice: Decimal;
        quantity: number;
        unitPrice: Decimal;
        totalPrice: Decimal;
      }[] = [];

      for (const service of selectedServices) {
        const quantity = Math.floor(Math.random() * 2) + 1;
        const unitPrice = service.price;
        const totalPrice = unitPrice.mul(quantity);
        subtotal = subtotal.add(totalPrice);

        orderItems.push({
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: service.price,
          quantity,
          unitPrice,
          totalPrice,
        });
      }

      const tax = subtotal.mul(0.19); // 19% VAT in Germany
      const totalPrice = subtotal.add(tax);

      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          clientId: client.id,
          subtotal,
          tax,
          totalPrice,
          currency: 'EUR',
          status,
          completedAt: status === OrderStatus.COMPLETED ? new Date() : null,
          notes: status === OrderStatus.PENDING ? 'Awaiting confirmation' : null,
          items: {
            create: orderItems,
          },
        },
      });

      // Create payment for completed orders
      if (status === OrderStatus.COMPLETED) {
        const platformFee = totalPrice.mul(0.05); // 5% platform fee
        const stripeFee = totalPrice.mul(0.029).add(0.25); // ~2.9% + €0.25
        const vendorPayout = totalPrice.sub(platformFee).sub(stripeFee);

        await prisma.payment.create({
          data: {
            orderId: order.id,
            stripePaymentIntentId: `pi_test_${order.id.slice(0, 16)}`,
            amount: totalPrice,
            currency: 'EUR',
            platformFee,
            stripeFee,
            vendorPayout,
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
          },
        });
      }

      console.log(`   ✓ ${orderNumber} (${status}) - €${totalPrice.toFixed(2)}`);
    }
  }
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
