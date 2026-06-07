import enum
from sqlalchemy import Column, String, Boolean, ForeignKey, Table, Enum as SQLEnum, text
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# ==========================================
# PostgreSQL Enum 型の定義
# ==========================================

class ContentVisibility(str, enum.Enum):
    private = "private"
    public = "public"
    unlisted = "unlisted"

class StoryResult(str, enum.Enum):
    success = "success"
    normal = "normal"
    failure = "failure"


# ==========================================
# SQLAlchemy モデル定義
# ==========================================

class Profile(Base):
    """
    ユーザープロフィールテーブル
    auth.users の ID と 1:1 で紐づくアプリ固有のユーザー情報
    """
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, nullable=False)
    display_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    
    # タイムスタンプ（defaultにはSQL関数の now() を指定）
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("now()"))

    # リレーションシップ（紐づく相談履歴や体験談をコード側で扱いやすくするため）
    consultations = relationship("GiftConsultation", back_populates="user", cascade="all, delete-orphan")
    stories = relationship("GiftStory", back_populates="user", cascade="all, delete-orphan")


class GiftConsultation(Base):
    """
    AI相談履歴テーブル
    """
    __tablename__ = "gift_consultations"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", on_delete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    
    # JSONB 型で入力条件とAI返答を保持
    input_conditions = Column(JSONB, nullable=False)
    ai_response = Column(JSONB, nullable=False)
    
    is_favorite = Column(Boolean, nullable=False, default=False)
    
    # 先ほど定義した Python の Enum を指定、DB側でも 'content_visibility' と紐付け
    visibility = Column(
        SQLEnum(ContentVisibility, name="content_visibility", inherit_schema=True),
        nullable=False,
        default=ContentVisibility.private
    )
    
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("now()"))

    # プロフィールへのリレーション
    user = relationship("Profile", back_populates="consultations")


class GiftStory(Base):
    """
    体験談投稿テーブル
    """
    __tablename__ = "gift_stories"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id", on_delete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    relationship_target = Column("relationship", String, nullable=False)  # Pythonの予約語衝突を避けるためカラム名をマッピング
    purpose = Column(String, nullable=False)
    budget_range = Column(String, nullable=False)
    gift_item = Column(String, nullable=False)
    
    # 体験談の結果Enum ('success', 'normal', 'failure')
    result = Column(
        SQLEnum(StoryResult, name="story_result", inherit_schema=True),
        nullable=False
    )
    
    body = Column(String, nullable=False)
    
    # PostgreSQL固有の文字列配列型
    keywords = Column(ARRAY(String), nullable=False, server_default="{}")
    
    visibility = Column(
        SQLEnum(ContentVisibility, name="content_visibility", inherit_schema=True),
        nullable=False,
        default=ContentVisibility.public
    )
    
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("now()"))
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=text("now()"))

    # プロフィールへのリレーション
    user = relationship("Profile", back_populates="stories")