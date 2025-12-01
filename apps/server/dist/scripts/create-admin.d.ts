declare function generateSecurePassword(length?: number): string;
declare function hashPassword(password: string): string;
declare function generateAdminCredentials(): {
    email: string;
    password: string;
    passwordHash: string;
    role: string;
    createdAt: string;
};
export { generateAdminCredentials, hashPassword, generateSecurePassword };
