import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'ecofeed-super-secret-key-12345')
    JWT_SECRET = os.environ.get('JWT_SECRET', 'jwt-signing-secret-67890')
    
    # Database Configuration: Fallback to SQLite if MySQL URL is not provided
    # MySQL format: mysql+pymysql://username:password@host:port/database_name
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_PORT = os.environ.get('MYSQL_PORT', '3306')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'ecofeed_db')
    
    mysql_uri = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
    sqlite_uri = "sqlite:///" + os.path.join(os.path.abspath(os.path.dirname(__file__)), "ecofeed.db")
    
    # If MYSQL_URL is explicitly set, use it. Otherwise, use build mysql URI if MYSQL_HOST is customized.
    # By default, use sqlite for immediate zero-config runner unless DB_TYPE is mysql
    DB_TYPE = os.environ.get('DB_TYPE', 'sqlite')
    
    if DB_TYPE == 'mysql':
        SQLALCHEMY_DATABASE_URI = mysql_uri
    else:
        SQLALCHEMY_DATABASE_URI = sqlite_uri
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
