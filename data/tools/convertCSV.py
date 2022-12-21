import sys
import pandas as pd

def makeCSV(filename):

    def getNumber(string):
        return int(string.split(",")[0])

    def getInt(string):
        return int(string)
    
    def getYear(string):
        return int(string.split("-")[2])

    df  = pd.read_csv(filename, delimiter=";", encoding='unicode_escape')
    df = df[df['HOEDANIGHEID_OMSCHRIJVING'] == 't.o.v. Normaal Amsterdams Peil']

    keep_col = ['X','Y','NUMERIEKEWAARDE', 'WAARNEMINGDATUM']
    new_f = df[keep_col]
    new_f['NUMERIEKEWAARDE'] = new_f['NUMERIEKEWAARDE'].apply(getInt)
    new_f = new_f[new_f['NUMERIEKEWAARDE'] < 10000] # Remove erroneous 99999999 values
    new_f['WAARNEMINGDATUM'] = new_f['WAARNEMINGDATUM'].apply(getYear) # Add datum in year value
    
    small_f = new_f.groupby(['X', 'Y', 'WAARNEMINGDATUM'], as_index=False).mean() # Take mean water level of location
    small_f['X'] = small_f['X'].apply(getNumber)
    small_f['Y'] = small_f['Y'].apply(getNumber)

    new_filename = str(small_f['WAARNEMINGDATUM'][0]) + ".csv"

    small_f.to_csv("waterlevel" + new_filename)


if __name__ == "__main__":
    arg = sys.argv[1]
    if isinstance(arg, str):
        makeCSV(arg)
