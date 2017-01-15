# instructors

a [Sails](http://sailsjs.org) application

## API documentation

Using [sails-swagger](https://github.com/langateam/sails-swagger) and [swagger-ui](https://github.com/swagger-api/swagger-ui), you can see all available api methods for this application at `/docs`.

## Database use

Current iteration uses MySQL database in a Docker container.

    docker run -e MYSQL_ROOT_PASSWORD=my-secret-pw -e MYSQL_USER=instructor_admin -e MYSQL_PASSWORD=sail$ -e MYSQL_DATABASE=instructors -d -p 32768:3306 mysql:latest

