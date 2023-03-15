
 const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc'); 
    
 class PaymentService{

     getSheet = async (userStripeId) => {
        // Use an existing Customer ID if this is a returning customer.
        if(!userStripeId){
            const customer = await stripe.customers.create();
            userStripeId = customer.id;
        }
        const ephemeralKey = await stripe.ephemeralKeys.create(
          {customer: userStripeId},
          {apiVersion: '2022-11-15'}
        );
        const paymentIntent = await stripe.paymentIntents.create({
          amount: 1099,
          currency: 'usd',
          customer: userStripeId,
          automatic_payment_methods: {
            enabled: true,
          },
        });
      
        return {
          paymentIntent: paymentIntent.client_secret,
          ephemeralKey: ephemeralKey.secret,
          customer: userStripeId,
          publishableKey: 'pk_test_TYooMQauvdEDq54NiTphI7jx'
      
        };
      }



}


module.exports = new PaymentService();