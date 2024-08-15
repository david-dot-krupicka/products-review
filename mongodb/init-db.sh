#!/usr/bin/env bash
# TODO: Improve this way to create users.
# TODO: We could use Mongo's community-operator to create users.
echo "Creating mongo users..."

# Retry loop for connecting to the database
max_retries=5
retry_count=0
sleep_interval=5

until /usr/bin/mongosh --norc --quiet --eval "db.db.getMongo()" > /dev/null 2>&1; do
  retry_count=$((retry_count + 1))
  if [ $retry_count -ge $max_retries ]; then
    echo "Failed to connect to MongoDB after $max_retries attempts."
    exit 1
  fi
  echo "Retrying to connect to MongoDB ($retry_count/$max_retries)..."
  sleep $sleep_interval
done

echo "Connected to MongoDB."

if [[ ! -f /data/db/.root_user_created ]]; then
  /usr/bin/mongosh <<EOF
    use admin
    db.createUser({
      user: 'root',
      pwd: 'root',
      roles: ['root']
    });
EOF
  touch /data/db/.root_user_created
  echo "Mongo root created."
fi

/usr/bin/mongosh -u root -p root admin <<EOF
  if (db.getUser('test') == null) {
    db.createUser({
      user: 'test',
      pwd: 'test123',
      roles: [
        { role: 'read', db: 'products' },
        { role: 'readWrite', db: 'products' }
      ]
    });
  }
EOF

# Verify users
user_count=$(/usr/bin/mongosh --quiet -u root -p root admin --eval 'db.system.users.find({}, {"_id" : 1}).count()')

if [[ -z $user_count || $user_count < 2 ]]; then
  echo "Failed to create users."
  exit 1
fi

echo "Mongo users created."
