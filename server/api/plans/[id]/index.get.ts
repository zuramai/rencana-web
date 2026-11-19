export default defineEventHandler(async (event) => {
  const { userId: _userId, ...plan } = await requirePlan(event, getRouterParam(event, 'id'))
  return plan
})
