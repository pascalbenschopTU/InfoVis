import csv
import numpy as np

filename = "./data/SeaLevelDataset.csv"
outFile = "./data/SeaLevelDatasetParsed.csv"
outFile2 = "./data/SeaLevelDatasetParsed2.csv"


def parseDataset(filename, outFilename):
    rows = []

    with open(filename, "r") as f:
        reader = csv.reader(f, delimiter=",")
        for row in reader:
            r = []
            for e in row:
                r.append(e.strip())
            rows.append(r)

    # rows = np.array(rows)
    rows = rows[3::4]
    parsedRows = []

    year = 19

    for r in rows:
        t = r
        if "-" in t[0]:
            t[0] = t[0].split("-")[0]
        elif "/" in t[0] and year == 19:
            s = t[0].split("/")
            t[0] = "19" + s[2]
            if int(s[2]) == 99:
                year = 20
        elif "/" in t[0] and year == 20:
            t[0] = "20" + t[0].split("/")[2]

    with open(outFile, "w") as f:
        writer = csv.writer(f, delimiter=",")
        writer.writerows(rows)


def rescaleDataset(file, outF):
    rows = []

    with open(file, "r") as f:
        reader = csv.reader(f, delimiter=",")
        for row in reader:
            r = []
            for e in row:
                r.append(e.strip())
            rows.append(r)
        header = rows[0]
        rows = np.array(rows[1:])
    values = rows[:, 1].astype(float)
    maxVal = np.max(np.abs(values))
    vals = values + maxVal
    output = [header]
    for d, v in zip(rows[:, 0], vals):
        output.append([d, round(v, 4)])

    with open(outF, "w") as f:
        writer = csv.writer(f, delimiter=",")
        writer.writerows(output)

if __name__ == "__main__":
    # parseDataset(filename, outFile)
    rescaleDataset(outFile, outFile2)
