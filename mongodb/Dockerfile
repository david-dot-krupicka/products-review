FROM docker.io/mongo

# It won't be automatically executed, because the /data/db dir is not empty.
ADD ./init-db.sh /docker-entrypoint-initdb.d/init-db.sh

ENTRYPOINT ["mongod", "--bind_ip_all", "--auth"]
