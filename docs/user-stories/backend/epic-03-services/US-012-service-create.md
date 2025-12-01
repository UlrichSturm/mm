# US-012: Создание услуги

**Epic:** E-003 Services Catalog  
**Portal:** Backend  
**Приоритет:** 🔴 Must Have  
**Story Points:** 3  
**Статус:** ⬜ Не начато

---

## User Story

**Как Vendor**, я хочу создать услугу, чтобы клиенты могли ее найти и заказать

---

## Acceptance Criteria

- [ ] Endpoint `POST /services` доступен только VENDOR
- [ ] Только APPROVED vendors могут создавать услуги
- [ ] Поля: name, description, price, categoryId, images (опционально)
- [ ] Валидация всех обязательных полей
- [ ] Price должен быть положительным числом
- [ ] CategoryId должен существовать
- [ ] Услуга связывается с VendorProfile автоматически

---

## API Specification

### Request

```http
POST /services
Authorization: Bearer <vendor-token>
Content-Type: application/json

{
  "name": "Организация похорон под ключ",
  "description": "Полный комплекс ритуальных услуг включая транспорт, оформление документов и поминальный обед",
  "price": 45000,
  "categoryId": "uuid",
  "images": ["https://example.com/image1.jpg"]
}
```

### Response (Success - 201)

```json
{
  "id": "uuid",
  "name": "Организация похорон под ключ",
  "description": "Полный комплекс ритуальных услуг...",
  "price": 45000,
  "categoryId": "uuid",
  "vendorId": "uuid",
  "images": ["https://example.com/image1.jpg"],
  "status": "ACTIVE",
  "createdAt": "2025-12-01T10:00:00Z",
  "vendor": {
    "id": "uuid",
    "businessName": "Ритуальные услуги АИ"
  }
}
```

### Response (Error - 403 - Not Approved)

```json
{
  "statusCode": 403,
  "message": "Only approved vendors can create services",
  "error": "Forbidden"
}
```

### Response (Error - 400)

```json
{
  "statusCode": 400,
  "message": ["name should not be empty", "price must be a positive number"],
  "error": "Bad Request"
}
```

---

## Database Schema

```prisma
model Service {
  id          String        @id @default(uuid())
  vendorId    String
  vendor      VendorProfile @relation(fields: [vendorId], references: [id])
  categoryId  String?
  category    Category?     @relation(fields: [categoryId], references: [id])
  
  name        String
  description String
  price       Decimal       @db.Decimal(10, 2)
  images      String[]
  
  status      ServiceStatus @default(ACTIVE)
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  orders      Order[]
}

enum ServiceStatus {
  ACTIVE
  INACTIVE
  PENDING_REVIEW
}
```

---

## Create DTO

```typescript
export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsOptional()
  @IsUrl({}, { each: true })
  images?: string[];
}
```

---

## Technical Notes

- Проверять статус vendor перед созданием услуги
- Использовать Decimal для price (точность 2 знака)
- Валидировать categoryId если указан
- Автоматически связывать с vendorId из JWT

---

## Implementation

```typescript
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
async createService(
  @CurrentUser() user: User,
  @Body() dto: CreateServiceDto,
) {
  const vendor = await this.prisma.vendorProfile.findUnique({
    where: { userId: user.id },
  });
  
  if (!vendor) {
    throw new NotFoundException('Vendor profile not found');
  }
  
  if (vendor.status !== 'APPROVED') {
    throw new ForbiddenException('Only approved vendors can create services');
  }
  
  // Validate category if provided
  if (dto.categoryId) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
  }
  
  return this.prisma.service.create({
    data: {
      ...dto,
      vendorId: vendor.id,
    },
    include: {
      vendor: { select: { id: true, businessName: true } },
      category: true,
    },
  });
}
```

---

## Dependencies

- US-005 (RBAC система)
- US-006 (JWT Guard)
- US-007 (VendorProfile - vendor должен быть APPROVED)
- US-019 (Categories - опционально)

---

## Test Cases

1. ✅ APPROVED vendor может создать услугу
2. ✅ PENDING vendor получает 403
3. ✅ CLIENT получает 403
4. ✅ Валидация полей работает
5. ✅ Невалидный categoryId - ошибка
6. ✅ Price должен быть положительным

---

## Definition of Done

- [ ] Код написан и работает
- [ ] Unit тесты написаны (покрытие > 80%)
- [ ] API документация обновлена (Swagger)
- [ ] Code review пройден

