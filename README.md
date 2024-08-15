# Products review
RestAPI to handle product reviews.

## Quick start
1. [Install `tilt`](https://github.com/windmilleng/tilt#installing)
2. `git clone https://github.com/david-dot-krupicka/products-review.git`
3. `cd products-review`
4. `tilt up`

### TODO: deps


Notes:
* As I am learning the whole concept of REST API in node-ts,
  I used [a guide for Users REST API from Marcos Henrique da Silva](https://www.toptal.com/express-js/nodejs-typescript-rest-api-pt-1)
* I like it uses a robust, I would say desired, structure
  and I will reuse some parts of it. 
  In particular, I like stuff like JWT authentication and DAO/DTO concepts,
  which help with the separation of concerns.

Dev notes
* Tilt and the whole setup was a bit of a pain, but I like the idea of it.
* to setup mocha + chai tests, I had hard time, downgraded chai to 4.2.0, used loader, and it worked
* 