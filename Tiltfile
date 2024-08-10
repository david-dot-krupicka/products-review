# -*- mode: Python -*-

"""
  * Products Service
    * Language: Node.js
"""
load('ext://restart_process', 'docker_build_with_restart')

k8s_yaml([
    'deployments/products.yaml',
    'deployments/mongodb-secret.yaml',
    'deployments/mongodb.yaml',
    'deployments/redis.yaml',
])

# Port-forward services, so you can hit it them locally -- e.g. you
# can access the 'products' service in your browser at http://localhost:8080
k8s_resource('products', port_forwards='8000:8080')
k8s_resource('mongodb', port_forwards='27017')

# Load local_resource based on whether we're running in GitHub Actions or not.
GITHUB_MODE = os.getenv('GITHUB_MODE', 'false') == 'true'
LINT_CMD = 'kubectl exec -i $(kubectl get pods --no-headers -o custom-columns=":metadata.name" -l app=products) -- bash -c "yarn eslint ."'

# TODO: Move this to local Tiltfile.
if GITHUB_MODE:
    local_resource(
        'eslint',
        cmd=LINT_CMD,
        dir='products',
        deps=['./products/src', './products/eslint.config.mjs'],
        resource_deps=['products'],
    )
else:
    # TODO: Either get rid of this or maybe make it a command button in the UI.
    local_resource(
        'eslint',
        auto_init=False,
        cmd=LINT_CMD,
        dir='products',
        deps=['./products/src', './products/eslint.config.mjs'],
        resource_deps=['products'],
        trigger_mode=TRIGGER_MODE_AUTO
    )

# Service: products
docker_build_with_restart('products-review/products', 'products',
             build_args={'node_env': 'development', 'debug': 'products'},
             entrypoint='npx nodemon ./products.ts',        # TODO: do we need any --ext?
             live_update=[
                 sync('./products/src', '/app'),
                 sync('./products/eslint.config.mjs', '/app/eslint.config.mjs'),
                 sync('./products/package.json', '/app/package.json'),
                 sync('./products/tsconfig.json', '/app/tsconfig.json'),
                 sync('./products/yarn.lock', '/app/yarn.lock'),
                 run('cd /app && yarn install', trigger=['./products/package.json', './products/yarn.lock']),
             ])

# TODO:
# TODO: Dockerfile for mongodb, containing inital data setup, maybe.
