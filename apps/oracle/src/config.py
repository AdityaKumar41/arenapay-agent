from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ton_rpc_url: str = "https://testnet.toncenter.com/api/v2"
    ton_api_key: str = ""
    registry_contract_address: str = ""
    oracle_wallet_mnemonic: str = ""
    redis_url: str = "redis://localhost:6379"
    scoring_interval_seconds: int = 21600  # 6 hours per PRD §6.3
    allowed_origins: str = ""  # comma-separated; empty = API-only (internal Docker network)
    host: str = "0.0.0.0"
    port: int = 8001

    class Config:
        env_file = "../../.env"
        extra = "ignore"


settings = Settings()
