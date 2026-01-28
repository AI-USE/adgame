import { onRequestPost as __api_admin_add_dummy_js_onRequestPost } from "/app/functions/api/admin/add-dummy.js"
import { onRequestPost as __api_admin_config_js_onRequestPost } from "/app/functions/api/admin/config.js"
import { onRequestGet as __api_admin_data_js_onRequestGet } from "/app/functions/api/admin/data.js"
import { onRequestPost as __api_admin_delete_ranking_js_onRequestPost } from "/app/functions/api/admin/delete-ranking.js"
import { onRequestGet as __api_check_js_onRequestGet } from "/app/functions/api/check.js"
import { onRequestGet as __api_my_rank_js_onRequestGet } from "/app/functions/api/my-rank.js"
import { onRequestGet as __api_rankings_js_onRequestGet } from "/app/functions/api/rankings.js"
import { onRequestPost as __api_register_email_js_onRequestPost } from "/app/functions/api/register-email.js"
import { onRequestPost as __api_start_js_onRequestPost } from "/app/functions/api/start.js"

export const routes = [
    {
      routePath: "/api/admin/add-dummy",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_add_dummy_js_onRequestPost],
    },
  {
      routePath: "/api/admin/config",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_config_js_onRequestPost],
    },
  {
      routePath: "/api/admin/data",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_data_js_onRequestGet],
    },
  {
      routePath: "/api/admin/delete-ranking",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_delete_ranking_js_onRequestPost],
    },
  {
      routePath: "/api/check",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_check_js_onRequestGet],
    },
  {
      routePath: "/api/my-rank",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_my_rank_js_onRequestGet],
    },
  {
      routePath: "/api/rankings",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_rankings_js_onRequestGet],
    },
  {
      routePath: "/api/register-email",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_register_email_js_onRequestPost],
    },
  {
      routePath: "/api/start",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_start_js_onRequestPost],
    },
  ]