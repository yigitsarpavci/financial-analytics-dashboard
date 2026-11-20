import bcrypt

from app.core.security import get_password_hash, verify_password


def test_hash_and_verify_roundtrip():
    hashed = get_password_hash("correct horse battery staple")
    assert hashed.startswith("$2")
    assert verify_password("correct horse battery staple", hashed)
    assert not verify_password("wrong", hashed)


def test_hashes_are_salted():
    assert get_password_hash("same") != get_password_hash("same")


def test_verifies_existing_bcrypt_hashes_created_elsewhere():
    # Rows written by the previous passlib-based implementation use the same $2b$ format.
    legacy = bcrypt.hashpw(b"legacy-password", bcrypt.gensalt(rounds=4)).decode()
    assert verify_password("legacy-password", legacy)


def test_long_passwords_do_not_crash():
    long_password = "x" * 200
    hashed = get_password_hash(long_password)
    assert verify_password(long_password, hashed)


def test_malformed_hash_is_rejected_not_raised():
    assert verify_password("anything", "not-a-bcrypt-hash") is False
