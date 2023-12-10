import { Router } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { authenticate, ConfigModule } from "@medusajs/medusa";
import { getConfigFile } from "medusa-core-utils";
import { attachStoreRoutes } from "./routes/store";
import { attachAdminRoutes } from "./routes/admin";

export default (rootDirectory: string): Router | Router[] => {
  // Read currently-loaded medusa config
  const { configModule } = getConfigFile<ConfigModule>(
    rootDirectory,
    "medusa-config"
  );
  const { projectConfig } = configModule;

  // Set up our CORS options objects, based on config
  const storeCorsOptions = {
    origin: projectConfig.store_cors.split(","),
    credentials: true,
  };

  const adminCorsOptions = {
    origin: projectConfig.admin_cors.split(","),
    credentials: true,
  };

  // Set up express router
  const router = Router();

  // Set up root routes for store and admin endpoints, with appropriate CORS settings
  router.use("/store", cors(storeCorsOptions), bodyParser.json());
  router.use("/admin", cors(adminCorsOptions), bodyParser.json());

  // Add authentication to all admin routes *except* auth and account invite ones
  router.use(
    /\/admin\/((?!auth)(?!invites)(?!users\/reset-password)(?!users\/password-token).*)/,
    authenticate()
  );

  // Set up routers for store and admin endpoints
  const storeRouter = Router();
  const adminRouter = Router();

  // Attach these routers to the root routes
  router.use("/store", storeRouter);
  router.use("/admin", adminRouter);

  // Attach custom routes to these routers
  attachStoreRoutes(storeRouter);
  attachAdminRoutes(adminRouter);

  router.get("/store/products/:id/reviews", cors(storeCorsOptions), (req, res) => {
    const productReviewService = req.scope.resolve("productReviewService")
    productReviewService.getProductReviews(req.params.id).then((product_reviews) => {
      return res.json({
        product_reviews
      })
    })
  })

  router.use(bodyParser.json())
  router.options("/store/products/:id/reviews", cors(storeCorsOptions))
  router.post("/store/products/:id/reviews", cors(storeCorsOptions), (req, res) => {
    const productReviewService = req.scope.resolve("productReviewService")
    productReviewService.addProductReview(req.params.id, req.body.data).then((product_review) => {
      return res.json({
        product_review
      })
    })
  })

  const corsOptions = {
    origin: projectConfig.admin_cors.split(","),
    credentials: true,
  }
  router.options("/admin/products/:id/reviews", cors(corsOptions))
  router.get("/admin/products/:id/reviews", cors(corsOptions), async (req, res) => {
    const productReviewService = req.scope.resolve("productReviewService")
    productReviewService.getProductReviews(req.params.id).then((product_reviews) => {
      return res.json({
        product_reviews
      })
    })
  })


  return router;
};
