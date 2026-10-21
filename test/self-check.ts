import * as assert from 'node:assert';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from '../src/modules/auth/dto/register.dto';
import { LoginDto } from '../src/modules/auth/dto/login.dto';
import { CreateOrderDto } from '../src/modules/orders/dto/create-order.dto';

async function runSelfChecks() {
  console.log('🧪 Running automated self-checks...');

  // 1. Password Hashing Check
  const plainPassword = 'SecurePassword123!';
  const hash = await bcrypt.hash(plainPassword, 10);
  assert.strictEqual(await bcrypt.compare(plainPassword, hash), true, 'Bcrypt hash should match plain password');
  assert.strictEqual(await bcrypt.compare('WrongPassword', hash), false, 'Bcrypt hash should reject wrong password');
  console.log('  ✔ Password hashing & validation verified');

  // 2. DTO Validation - RegisterDto
  const invalidRegister = plainToInstance(RegisterDto, {
    fullName: '',
    email: 'not-an-email',
    password: '123',
    confirmPassword: '456',
  });
  const regErrors = await validate(invalidRegister);
  assert.strictEqual(regErrors.length > 0, true, 'Invalid RegisterDto must produce validation errors');

  const validRegister = plainToInstance(RegisterDto, {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  });
  const validRegErrors = await validate(validRegister);
  assert.strictEqual(validRegErrors.length, 0, 'Valid RegisterDto must have 0 errors');
  console.log('  ✔ RegisterDto validation constraints verified');

  // 3. DTO Validation - LoginDto
  const invalidLogin = plainToInstance(LoginDto, { email: 'bad-email', password: '' });
  const loginErrors = await validate(invalidLogin);
  assert.strictEqual(loginErrors.length > 0, true, 'Invalid LoginDto must fail validation');

  const validLogin = plainToInstance(LoginDto, { email: 'user@example.com', password: 'secretpassword' });
  const validLoginErrors = await validate(validLogin);
  assert.strictEqual(validLoginErrors.length, 0, 'Valid LoginDto must pass');
  console.log('  ✔ LoginDto validation constraints verified');

  // 4. DTO Validation - CreateOrderDto
  const emptyOrder = plainToInstance(CreateOrderDto, {});
  const orderErrors = await validate(emptyOrder);
  assert.strictEqual(orderErrors.length >= 3, true, 'CreateOrderDto requires customerName, phone, address');
  console.log('  ✔ CreateOrderDto validation constraints verified');

  console.log('🎉 All self-checks passed successfully!');
}

runSelfChecks().catch((err) => {
  console.error('❌ Self-check failed:', err);
  process.exit(1);
});
