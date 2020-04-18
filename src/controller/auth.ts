export const requireAuth = async (ctx: Context, next: Next) => {
  if (ctx.isAuthenticated()) {
    return next();
  } else {
    ctx.body = { success: false };
    ctx.throw(401);
  }
};
