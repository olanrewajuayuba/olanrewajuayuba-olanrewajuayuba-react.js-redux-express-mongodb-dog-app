const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const axios = require("axios");
var fs = require("fs");
const request = require("request");
var i2b = require("imageurl-base64");

//get user schema
const User = require("../../models/User");

// Dog model
const Dog = require("../../models/Dog");
const dogBreed = require("../../DogBreeds");
const visionKey = require("../../config/keys").visionAPI;
const visionAuth = require("../../config/keys").visionAuth;

// @route  /api/dogs/test
// @desc   Tests user route
// @access PUBLIC
router.get("/test", (req, res) => res.json({ msg: "Dogs works!" }));

// @route  /api/dogs/
// @desc   Get all dogs
// @access PRIVATE
router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Dog.find()
            .sort({ createdAt: -1 })
            .then(dogs => {
                //const dogsObjects = dogs.map(dog => dog.toObject());
                //     .sort((a, b) => (a.priority > b.priority ? -1 : 1));
                const userDogs = [];
                dogs.forEach(dog => {
                    if (dog.owner.equals(req.user.id)) {
                        userDogs.push(dog);
                    }
                });
                console.log("*****userDogs*****", userDogs);
                return userDogs;
            })
            .then(dogs => res.status(200).json(dogs))
            .catch(err => res.status(404));
    }
);

// @route  /api/dogs/dog/:id
// @desc   Get individual dog info
// @access PRIVATE
router.get("/dog/:id", (req, res) => {
    Dog.findById(req.params.id)
        .then(dog => res.json(dog))
        .catch(err => res.status(404));
});
//dog => res.status(200).json({ dog: dog })  res.status(200).json(res)

// @route  /api/dogs/
// @desc   Post dog info
// @access PRIVATE
router.post(
    "/dogs",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // pulls image from post request to server and sends post request to google API
        const image = req.body.imageUrl;
        console.log("***** Image URL *****", image);
        var predictions = [];
        axios({
            method: "post",
            url: "https://vision.googleapis.com/v1/images:annotate",
            params: {
                key: visionKey
            },
            headers: {
                Authorization: visionAuth
            },
            data: {
                requests: [
                    {
                        image: {
                            source: {
                                imageUri: "gs://know-your-dog-2/" + req.body.imageUrl
                            }
                        },
                        features: [
                            {
                                type: "LABEL_DETECTION",
                                maxResults: 10
                            }
                        ]
                    }
                ]
            }
        })
            .then(function (response) {
                var webEntities = response.data.responses[0].labelAnnotations;
                console.log(response.data.responses[0]);
                predictions = webEntities.map(entity => {
                    return entity.description;
                });

                const descripProbMap = webEntities.map(entity => ({
                    description: entity.description,
                    probability: entity.score
                }));
                console.log("descripProbMap", descripProbMap);

                // Check if array of label objects contains any descriptions with the value dog
                const isDog = function () {
                    if (
                        descripProbMap.some(
                            entity => entity.description.toLowerCase() === "dog" || "puppy"
                        )
                    ) {
                        return descripProbMap;
                    } else {
                        predictions = "Not a dog!";
                        return { description: "Not a dog!" };
                    }
                };
                // console.log(" **********");
                // console.log(" ***** IS DOG *****", (abc = isDog()));

                // maps through array of known dog breeds and changes all to lower case to match
                // vision api response
                const dogBreedLowerCase = dogBreed.map(breed => breed.toLowerCase());
                // function to check if description value from google vision is a known
                // dog breed
                const breedChecker = function (label) {
                    if (
                        dogBreedLowerCase.some(
                            breed => breed === label.description.toLowerCase()
                        )
                    ) {
                        return label;
                    }
                };
                // maps through array of label objects and return key pairs
                // where the key value is a known dog breed
                const breedCheckerMap = function () {
                    if (isDog().description !== "Not a dog!") {
                        return isDog().map(label => breedChecker(label));
                    }
                };
                // maps through array of label objects and removes undefined objects
                const breedCheckerUndefinedFilter = function () {
                    if (isDog().description !== "Not a dog!") {
                        return breedCheckerMap().filter(breed => breed !== undefined);
                    } else {
                        return isDog();
                    }
                };
                // maps through label keys and values and capitalizes all first letters
                const capitalizer = function (breed) {
                    return breed
                        .toLowerCase()
                        .split(" ")
                        .map(s => s.charAt(0).toUpperCase() + s.substring(1))
                        .join(" ");
                };
                // maps through processed array of label objects and values to be added to new dog
                const dogDataDisplayReady = function () {
                    if (breedCheckerUndefinedFilter().length === 0) {
                        return { description: "Unknown Dog" };
                    } else if (
                        breedCheckerUndefinedFilter().description === "Not a dog!"
                    ) {
                        return breedCheckerUndefinedFilter();
                    } else {
                        const capitalizedBreed = breedCheckerUndefinedFilter().map(
                            breed => ({
                                description: capitalizer(breed.description),
                                probability: breed.probability * 100
                            })
                        );
                        return capitalizedBreed;
                    }
                };
                console.log("******** response4 **********", dogDataDisplayReady());
                const test = dogDataDisplayReady();

                var breeds = test.map(entity => {
                    return entity.description;
                });

                var probabilities = test.map(entity => {
                    return entity.probability;
                });
                console.log("****** BREED *****", breeds);
                console.log("****** PROBABILITY *****", probabilities);

                const newDog = new Dog({
                    image: req.body.imageUrl,
                    breed: breeds,
                    probability: probabilities,
                    owner: req.user.id
                });

                newDog.save().then(dog => {
                    console.log("dog", dog);
                    res.status(200).json({ dog: dog });
                });

                res.json({
                    id: req.user.id,
                    image: req.body.imageUrl,
                    breed: breeds,
                    probability: probabilities
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    }
);

module.exports = router;
