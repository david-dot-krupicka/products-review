# -*- mode: Python -*-

"""
  * Products Service
    * Language: Node.js
"""
load('ext://restart_process', 'docker_build_with_restart')
# load('ext://helm_resource', 'helm_resource', 'helm_repo')

k8s_yaml([
    'deployments/products.yaml',
    'deployments/mongodb-secret.yaml',
    'deployments/mongodb.yaml',
    'deployments/redis.yaml',
])

"""
# Install MongoDB operator with helm
helm_repo('mongodb-repo', 'https://mongodb.github.io/helm-charts')
helm_resource(
    'community-operator',
    'mongodb-repo/community-operator',
    'mongodb-repo/community-operator',
    resource_deps=['mongodb-repo']
)
"""

k8s_resource('mongodb', port_forwards='27017')
# k8s_resource('redis')

# Port-forward services, so you can hit it them locally -- e.g. you
# can access the 'products' service in your browser at http://localhost:8080
k8s_resource('products', port_forwards='8000:8080', resource_deps=['mongodb', 'redis'])

KUBE_EXEC = 'kubectl exec -i $(kubectl get pods --no-headers \
    -o custom-columns=":metadata.name" -l app=products) -- bash -c '

# Linting
LINT_CMD = KUBE_EXEC + '"yarn eslint ."'
# TODO: Move this to local Tiltfile.
local_resource(
    'eslint',
    cmd=LINT_CMD,
    dir='products',
    deps=['./products/src', './products/eslint.config.mjs'],
    resource_deps=['products'],
)

local_resource(
    'npm test',
    cmd='yarn test',
    dir='products',
    deps=['./products/src'],
    resource_deps=['products'],
)

"""
local_resource(
    'mongodb-init',
    cmd='./init-db.sh',
    dir='mongodb',
    deps=['./mongodb/init-db.sh'],
    resource_deps=['mongodb'],
)
"""

# Service: mongodb
docker_build(
    'products-review/mongodb', 'mongodb',
)

# Service: products
docker_build_with_restart(
    'products-review/products', 'products',
    build_args={'node_env': 'development', 'debug': 'app*'},
    entrypoint='npx nodemon ./app.ts',        # TODO: do we need any --ext?
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
