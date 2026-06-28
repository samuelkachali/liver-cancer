"""Generate bcrypt hash for seeding admin user. Usage: python scripts/seed_admin.py"""
import bcrypt

if __name__ == "__main__":
    password = "admin123"
    print(bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode())
