import planService from 'core/services/plan.service'

export default async function planPricingUpdate() {
    //updating 3 months plan pricing

    let newThreeMonthPlanPrice = parseInt(2500)

    const threeMonthPlan = await planService.findPlanByTitle(
        '3 months Dealer plan'
    )

    await planService.updatePlanDetails(threeMonthPlan._id, {
        amount: newThreeMonthPlanPrice,
    })

    //updating 6 months plan pricing
    let newSixMonthPlanPrice = parseInt(3500)
    const sixMonthPlan = await planService.findPlanByTitle(
        '6 months Dealer plan'
    )
    await planService.updatePlanDetails(sixMonthPlan._id, {
        amount: newSixMonthPlanPrice,
    })

    //updating 9 months plan
    let newOneYearPlanPrice = parseInt(5000)
    const oneYearPlan = await planService.findPlanByTitle(
        '12 months Dealer plan'
    )
    await planService.updatePlanDetails(oneYearPlan._id, {
        amount: newOneYearPlanPrice,
    })
}
