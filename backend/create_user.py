"""
Corre este script para crear un usuario:
  python create_user.py
"""
import sys
import os
import getpass
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from config.database import SessionLocal
from models.userModels import User
from services.authService import hash_password

def main():
    username = input("Nombre de usuario: ").strip()
    if not username:
        print("El nombre de usuario no puede estar vacío.")
        return

    role = input("Rol (admin / vendedor): ").strip().lower()
    if role not in ("admin", "vendedor"):
        print("Rol inválido. Usa 'admin' o 'vendedor'.")
        return

    password = getpass.getpass("Contraseña (máx 72 caracteres): ")
    if len(password) < 6:
        print("La contraseña debe tener al menos 6 caracteres.")
        return
    if len(password) > 72:
        print("La contraseña no puede tener más de 72 caracteres.")
        return
    confirm = getpass.getpass("Confirmar contraseña: ")
    if password != confirm:
        print("Las contraseñas no coinciden.")
        return

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            print(f"El usuario '{username}' ya existe.")
            return
        user = User(username=username, password_hash=hash_password(password), role=role)
        db.add(user)
        db.commit()
        print(f"Usuario '{username}' creado con rol '{role}'.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
