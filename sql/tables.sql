CREATE TABLE 'running_session'
(
    'indexRunningSession' int AUTO_INCREMENT NOT NULL PRIMARY KEY,
    'date' date NOT NULL,
    'totalDistance' int NOT NULL   
)


CREATE TABLE 'coordinates'
(
    'indexCoordinates' int AUTO_INCREMENT NOT NULL PRIMARY KEY,
    'indexRunningSession' int NOT NULL,
    'x' float NOT NULL,
    'y' float NOT NULL
)