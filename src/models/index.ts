import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

// User
export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
}
export interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare username: string;
  declare email: string;
  declare passwordHash: string;
}
User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING(50), allowNull: false },
    email: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING(100), allowNull: false },
  },
  { sequelize, modelName: 'user', underscored: true, freezeTableName: true }
);

// Product
export interface ProductAttributes {
  id: number;
  url: string;
  name: string;
}
export interface ProductCreationAttributes extends Optional<ProductAttributes, 'id'> {}
export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  declare id: number;
  declare url: string;
  declare name: string;
}
Product.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    url: { type: DataTypes.STRING(1024), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
  },
  { sequelize, modelName: 'product', underscored: true, freezeTableName: true }
);

// Review
export interface ReviewAttributes {
  id: number;
  productId: number;
  rating: number;
  content: string;
}
export interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id'> {}
export class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  declare id: number;
  declare productId: number;
  declare rating: number;
  declare content: string;
}
Review.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    rating: { type: DataTypes.FLOAT, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, modelName: 'review', underscored: true, freezeTableName: true }
);

// Analysis
export interface AnalysisAttributes {
  id: number;
  userId: number;
  productId: number;
  averageRating: number;
  totalReviews: number;
  positive: number;
  neutral: number;
  negative: number;
  sampleInsights: string[];
  createdAt?: Date;
}
export interface AnalysisCreationAttributes extends Optional<AnalysisAttributes, 'id' | 'createdAt'> {}
export class Analysis extends Model<AnalysisAttributes, AnalysisCreationAttributes> implements AnalysisAttributes {
  declare id: number;
  declare userId: number;
  declare productId: number;
  declare averageRating: number;
  declare totalReviews: number;
  declare positive: number;
  declare neutral: number;
  declare negative: number;
  declare sampleInsights: string[];
  declare createdAt?: Date | undefined;
}
Analysis.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    averageRating: { type: DataTypes.FLOAT, allowNull: false },
    totalReviews: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    positive: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    neutral: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    negative: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    sampleInsights: { type: DataTypes.JSON, allowNull: false },
  },
  { sequelize, modelName: 'analysis', underscored: true, freezeTableName: true }
);

// Associations
User.hasMany(Analysis, { foreignKey: 'userId' });
Analysis.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Review, { foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(Analysis, { foreignKey: 'productId' });
Analysis.belongsTo(Product, { foreignKey: 'productId' });
