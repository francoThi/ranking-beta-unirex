const fs = require('fs');

let rawdataUnirexes = fs.readFileSync("./data/metadata_V2.5_with_arweave_links.json");
let rawdataRarity = fs.readFileSync("./data/metadata_V2.5_-_rarity.json");
let rawdataTokens = fs.readFileSync("./data/unirexes-tokens.json").toString();

const rarityAttributes = JSON.parse(rawdataRarity);
const unirexes = JSON.parse(rawdataUnirexes);
const tokens = JSON.parse(rawdataTokens);

var ranking = [];

tokens.forEach((token) => {
    const unirex = getUnirexByToken(token); // token

    var points = 0;
    // console.log(unirex.attributes);

    unirex.attributes.forEach((attribute) => {
        points = points + getPointsByAttribute(attribute);
    });

    // Extra points for Crolex special type
    if (unirex.name.toString().includes("Crolex")) points = points + 150
    // Extra points for Statue special type
    if (unirex.name.toString().includes("Statue")) points = points + 80

    var unirexValue = {
        "name": unirex.name,
        "token": unirex.token,
        "image": unirex.image,
        "points": points.toFixed(3),
        // "attributes": unirex.attributes
    }

    ranking.push(unirexValue);
    ranking.sort(function(a, b){
        return b.points - a.points;
    });
});


fs.writeFile('./res/ranking_v1.json', JSON.stringify(ranking, null, 4), 'utf8', function(err) {
    if(err) return console.error(err);
});

function getUnirexByToken(token) {
    let unirex = unirexes.find(item => item.token === token);
    return unirex;
}

function getPointsByAttribute(attribute) {
    var trait_type = attribute.trait_type;
    var value = attribute.value;

    var coeff = getCoeff1(trait_type);
    if (coeff == undefined)
        coeff = 0.5

    if (trait_type != "Jewelries" && trait_type != "Sequence" && trait_type != "Tattoos count") {
        // console.log(trait_type + ": " + value + " ==> ");
        // console.log(rarityAttributes[trait_type][value]["percentage"]+ "% (Coeff: " + coeff + ")");
        var pts = (100 - rarityAttributes[trait_type][value]["percentage"]) * coeff;
        return pts;
    } else if (trait_type == "Jewelries") {
        var jewelries = attribute.value.split("/"); // length
        var jewelriesPoints = 0;

        // console.log(rarityAttributes[trait_type]);
        // console.log(jewelries);

        jewelries.forEach((jewelrie) => {
            jewelriesPoints = jewelriesPoints + rarityAttributes[trait_type][jewelrie]["percentage"];
        })
        jewelriesPoints = 100 - (jewelriesPoints / jewelries.length);
        // console.log(jewelriesPoints);
        var pts = jewelriesPoints * coeff;
        return pts;
    }

    return 0;
}

// TEST RARITY 1
function getCoeff1(trait_type) {

    var trait = trait_type.toLowerCase();

    const rarity1 = ["type"]; // 1
    const rarity2 = ["skin", "attributes count"]; // 0.8
    const rarity3 = ["hand objects"]; // 0.7
    const rarity4 = ["pupil", "teeth"]; // 0.6
    const rarity5 = [
        "clothing piece 1", "body cut", "scar", 
        "body color 1", "body color 2", "jaw", "gaze", 
        "eyes colors", "pupil", "arm", "glasses", "hat", 
        "clothing accessory", "tattoos"]; // 0.5
    const rarity6 = ["jewelries", "jewelries count"]; // 0.4
    const rarity7 = ["clothing piece 2", "background"]; // 0.3

    var coeff = 0.4;

    if (rarity1.includes(trait)) {
        coeff = 1;
    }
    else if (rarity2.includes(trait)) {
        coeff = 0.8;
    }
    else if (rarity3.includes(trait)) {
        coeff = 0.7;
    }
    else if (rarity4.includes(trait)) {
        coeff = 0.6
    }
    else if (rarity5.includes(trait)) {
        coeff = 0.5;
    }
    else if (rarity6.includes(trait)) {
        coeff = 0.4;
    }
    else if (rarity7.includes(trait)) {
        coeff = 0.3;
    }
    return coeff;
}