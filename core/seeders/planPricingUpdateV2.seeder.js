import planService from 'core/services/plan.service'

export default async function planPricingUpdateV2() {
    //updating 3 months plan pricing
    let newThreeMonthPlanPrice = parseInt(2000)
    const threeMonthPlan = await planService.findPlanByTitle(
        '3 months Dealer plan'
    )

    await planService.updatePlanDetails(threeMonthPlan._id, {
        amount: newThreeMonthPlanPrice,
    })
}
