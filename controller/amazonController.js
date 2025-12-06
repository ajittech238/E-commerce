import SellingPartnerAPI from "amazon-sp-api";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { warehouseProduct } from "../model/warehouseProductModel.js";
import { warehouseOrder } from "../model/warehouseOrderModel.js";
import { ErrorHandler } from ".././utils/Errorhandler.js";


//  GET TEMP AWS CREDENTIALS

const validateEnv = (keys = []) => {
  keys.forEach((key) => {
    if (!process.env[key]) {
      throw new ErrorHandler(`Missing environment variable: ${key}`, 500);
    }
  });
};

const getAwsCredentials = async () => {
  try {
    validateEnv(["AWS_REGION", "AWS_ACCESS_KEY", "AWS_SECRET_KEY", "ROLE_ARN"]);

    const stsClient = new STSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });

    const command = new AssumeRoleCommand({
      RoleArn: process.env.ROLE_ARN,
      RoleSessionName: "SPAPI_SESSION",
    });

    const res = await stsClient.send(command);

    if (!res?.Credentials) {
      throw new ErrorHandler("Failed to retrieve temporary AWS credentials", 500);
    }

    return {
      accessKeyId: res.Credentials.AccessKeyId,
      secretAccessKey: res.Credentials.SecretAccessKey,
      sessionToken: res.Credentials.SessionToken,
    };
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};


//  CREATE AMAZON INSTANCE

const createAmazonClient = async () => {
  try {
    validateEnv([
      "AWS_REGION",
      "AMAZON_REFRESH_TOKEN",
      "AMAZON_CLIENT_ID",
      "AMAZON_CLIENT_SECRET",
    ]);

    const aws = await getAwsCredentials();

    return new SellingPartnerAPI({
      region: process.env.AWS_REGION,
      refresh_token: process.env.AMAZON_REFRESH_TOKEN,
      credentials: {
        SELLING_PARTNER_APP_CLIENT_ID: process.env.AMAZON_CLIENT_ID,
        SELLING_PARTNER_APP_CLIENT_SECRET: process.env.AMAZON_CLIENT_SECRET,
        AWS_ACCESS_KEY_ID: aws.accessKeyId,
        AWS_SECRET_ACCESS_KEY: aws.secretAccessKey,
        AWS_SESSION_TOKEN: aws.sessionToken,
      },
    });
  } catch (error) {
    throw new ErrorHandler(`Amazon API client initialization failed: ${error.message}`, 500);
  }
};



//  CONTROLLER FUNCTIONS START

export const amazonController = {

 
    
  getAmazonProducts: async (req, res, next) => {
    try {
      validateEnv(["MARKETPLACE_ID"]);

      const sp = await createAmazonClient();

      const products = await sp.callAPI({
        operation: "getCatalogItems",
        query: { MarketplaceId: process.env.MARKETPLACE_ID },
      });

      return res.status(200).json({
        success: true,
        count: products?.Items?.length || 0,
        products,
      });

    } catch (error) {
      next(new ErrorHandler(error.message, 500));
    }
  },


  syncProductInventory: async (req, res, next) => {
    try {
      const { warehouseProductId } = req.params;

      if (!warehouseProductId) {
        return next(new ErrorHandler("warehouseProductId is required", 400));
      }

      const product = await warehouseProduct.findById(warehouseProductId);

      if (!product) {
        return next(new ErrorHandler("Warehouse product not found", 404));
      }

      if (!product.sku) return next(new ErrorHandler("Product SKU missing", 400));
      if (product.quantity == null) return next(new ErrorHandler("Product quantity missing", 400));

      validateEnv(["MARKETPLACE_ID"]);

      const sp = await createAmazonClient();

      const response = await sp.callAPI({
        operation: "submitInventoryUpdate",
        body: {
          sku: product.sku,
          quantity: product.quantity,
          marketplaceId: process.env.MARKETPLACE_ID,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Inventory synced to Amazon successfully",
        product: product.sku,
        response,
      });

    } catch (error) {
      next(new ErrorHandler(error.message, 500));
    }
  },


  fetchAmazonOrders: async (req, res, next) => {
    try {
      validateEnv(["MARKETPLACE_ID"]);

      const { warehouseId } = req.body;
      if (!warehouseId) return next(new ErrorHandler("warehouseId is required", 400));

      const sp = await createAmazonClient();

      const amazonOrders = await sp.callAPI({
        operation: "getOrders",
        query: {
          MarketplaceIds: [process.env.MARKETPLACE_ID],
          CreatedAfter: "2024-01-01",
        },
      });

      if (!amazonOrders?.Orders || amazonOrders?.Orders?.length === 0) {
        return next(new ErrorHandler("No Amazon orders found", 404));
      }

      const savedOrders = [];

      for (const o of amazonOrders?.Orders) {
        const newOrder = await warehouseOrder.create({
          sellerId: req.user?._id,
          warehouseId,
          items: [],
          totalAmount: o?.OrderTotal?.Amount || 0,
          paymentStatus: "pending",
          status: "pending",
          shippingAddress: o?.ShippingAddress || {},
        });

        savedOrders.push(newOrder);
      }

      res.status(200).json({
        success: true,
        message: "Amazon orders synced into warehouse successfully",
        orderCount: savedOrders.length,
        savedOrders,
      });

    } catch (error) {
      next(new ErrorHandler(error.message, 500));
    }
  },
};
