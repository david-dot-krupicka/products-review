# Products review
RestAPI to handle product reviews.

## Quick start
1. Install docker, kubectl, [k3d](https://k3d.io/v5.7.3/#install-script)
2. Install [tilt](https://github.com/windmilleng/tilt#installing), hopefully it will be enough to go
2. `git clone https://github.com/david-dot-krupicka/products-review.git`
3. `cd products-review`
4. `tilt up`

### Notes:
* As I am learning the whole concept of REST API in node-ts,
  I used [a guide for Users REST API from Marcos Henrique da Silva](https://www.toptal.com/express-js/nodejs-typescript-rest-api-pt-1).
* I like it uses a robust, I would say desired, structure and I will reuse some parts of it.\
  In particular, I like stuff like JWT authentication and DAO/DTO concepts,
  which help with the separation of concerns.
#### Dev notes
* Tilt and the whole setup was a bit of a pain, but I like the idea of it.
* I had hard time to setup mocha + chai tests (and not only that), but downgraded chai to 4.2.0, used loader, and it worked.
* The most problematic part was the infrastructure setup and linter.
* I also configured simple GitHub workflow in the very beginning, making the eslint permissive.
* Later on, I decided to fix all linter errors, because I saw it's in fact very important.

## Features
* Well... TILT! :-)
* REST API for products and reviews
* Sharding of reviews to multiple queues
* Cache implemented only for illustration on GET by ID. Caching lists (or pages) would require more processing and introspection of cached lists.

### Bugs found afterwards
* User can specify averageRating in create product and it's stored.\
  When creating or editing reviews, this should be covered, but not in products.\
  The validation middleware is very permissive.

## Failures (or let's say TODO's)
* My original idea was to reuse the users service. But it does not work well and to fine-tune it would take too much time.\
  That's also why I require the `userId` in the Create Review request.\
  My intention was to use it together with the users service and JWT token to get the user's name,\
  because the first and last name cannot be used as user identifier (some guys don't even have surname).\
  <b>This complicated my development life a lot, actually.</b> :-)
* There is almost no validation of the input data.
* Error handling may not be ideal.
* Test coverage is very poor. I had simply no time to learn the frameworks and write tests,\
  despite I know it would speed up and solidify the development in long term.
* Caching is very simple, illustrative. I implemented it only for GET by ID methods.\
  For caching the lists or pages, I would need to implement more complex logic (e.g. check the list content).
* Missing OpenAPI documentation. I at least included the export of my <b>Postman collection</b>.\
  Please have a look, I won't describe the whole API specification here.
* There is no `src` in `product-reviews`. During the development, I had an issue with Dockerfile context,\
  so I moved `src` to the root of the project. I did not have time to fix it.
* Add BullMQ Dashboard to the project.

## Infrastructure
* One pod for Products and Review API, with local Redis cache
* One pod for mongo database - could be also run in a cluster
* One pod for Redis message queue - could be clustered too
* Five pods for Review service - each pod listens to its own queue

## Database
All collections are in products database.
I chose to store reviews separately from products, so there's no review list in the products schema.\
Although it's possible in Mongo, considering real world, where one product can have million reviews,
it's better to store them separately.\
The list of reviews by product ID is GET /reviews.
I could implement it in products with some join to reviews, but this looked to be sufficient.

## How to change the number of review service replicas
This is a little bit crude. It would be better to use helm charts and different way of pods rollout.
1. Change the number of `replicas:` in `deployments/reviews.yaml`. 
   Pods will be redeployed.
2. Create new copy of `deployments/common-env-cfm.yaml`.
   1. Change the ConfigMap name.
   2. Change the `REPLICA_COUNT` value to the new number of replicas.
   3. Add the new file as `k8s_yaml` to the `Tiltfile`.
   4. Reference the new ConfigMap in `deployments/products.yaml` (`configMapRef`).
   5. Reference the new ConfigMap in `deployments/reviews.yaml` (`configMapRef`).

Step 2 will trigger the rebuild of the pods. Node.js will use this environment
variable as `totalShards` to create appropriate number of BullMQ queues.

## Users
This endpoint can be more or less ignored (although it took significant time to fix all linter errors there).\
It does not work well... :-/\
If someone wants to try:
1. make your own `users/.env`, the example is in `users/.env.example`
2. create your user with POST /users
3. register your user to create JWT tokens
4. set it in Postman environment and play