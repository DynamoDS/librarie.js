import type { Config } from "jest";

const config: Config = {
    preset:"ts-jest",
    testEnvironment: "jsdom",
    transform: {
      ".(ts|tsx)": "ts-jest"
    },
    testRegex: "(/__tests__/*/.*|\\.(test|spec))\\.(ts|tsx|js)$",
    moduleFileExtensions: [
      "ts",
      "tsx",
      "js",
      "json"
    ],
    moduleNameMapper: {
      "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.ts",
      "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.ts"
    },
    collectCoverageFrom: [
      "src/**/*.{ts,tsx}"
    ],
    testPathIgnorePatterns: [
      "__tests__/data/"
    ],
    snapshotSerializers: [
      "<rootDir>/node_modules/enzyme-to-json/serializer"
    ],
    reporters: [
      "default",
      [
        "jest-junit",
        {
          "outputDirectory": "TestResults",
          "outputName": "TestReport.xml",
          "classNameTemplate": "{classname}",
          "titleTemplate": "{title}"
        }
      ]
    ]
}

export default config;