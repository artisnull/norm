module.exports = {
    "transform": {
        "^.+\\.(t|j)sx?$": "babel-jest"
    },
    "collectCoverage": true,
    "collectCoverageFrom": [
        "./src/**"
    ]
}