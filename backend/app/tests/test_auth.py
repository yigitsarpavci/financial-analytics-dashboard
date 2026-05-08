import pytest
from app.core.security import verify_password, get_password_hash, create_access_token
from app.api.deps import get_current_user
from app.models.all_models import User
import jwt
from app.core.config import settings
from unittest.mock import MagicMock

def test_password_hashing():
    password = "secretpassword"
    hashed = get_password_hash(password)
    
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_create_access_token():
    token = create_access_token(1)
    
    # Verify the token decodes properly
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert decoded["sub"] == "1"
    assert "exp" in decoded

def test_get_current_user_valid_token():
    # Setup mock DB and user
    mock_db = MagicMock()
    mock_user = User(id=1, email="user@example.com")
    
    # Setup mock queries
    mock_query = MagicMock()
    mock_db.query.return_value = mock_query
    mock_filter = MagicMock()
    mock_query.filter.return_value = mock_filter
    mock_filter.first.return_value = mock_user
    
    # Create valid token
    token = create_access_token("1")
    
    # Execute dependency
    user = get_current_user(db=mock_db, token=token)
    
    # Verify
    assert user.email == "user@example.com"
    assert user.id == 1

def test_get_current_user_invalid_token():
    mock_db = MagicMock()
    
    # Execute dependency with invalid token
    with pytest.raises(Exception) as excinfo:
        get_current_user(db=mock_db, token="invalid.token.string")
        
    assert excinfo.value.status_code == 403
