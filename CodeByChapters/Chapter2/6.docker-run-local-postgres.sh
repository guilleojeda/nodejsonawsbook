docker run --name myPostgresDb -p 127.0.0.1:5432:5432 -e POSTGRES_USER=PostgresUser -e POSTGRES_PASSWORD=veryverysecret -e POSTGRES_DB=SimpleAWSDB -d postgres:16
