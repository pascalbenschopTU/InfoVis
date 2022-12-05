import sys
import pandas as pd

# Compare the values between two years
def makeCSV(filename1, filename2):

    df_1 = pd.read_csv(filename1)
    df_2 = pd.read_csv(filename2)

    year_1 = df_1["WAARNEMINGDATUM"][0]
    year_2 = df_2["WAARNEMINGDATUM"][0]
    
    combined_df = df_1.merge(df_2, left_on='X', right_on='X')
    print(combined_df)
    
    combined_df["NUMERIEKEWAARDE"] = combined_df["NUMERIEKEWAARDE_y"] - combined_df["NUMERIEKEWAARDE_x"]
    combined_df["Y"] = combined_df["Y_x"]

    new_filename = str(year_1) + "-" + str(year_2) + ".csv"

    combined_df.to_csv("waterlevel" + new_filename)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Provide 2 file names!")
        exit()
    arg1 = sys.argv[1]
    arg2 = sys.argv[2]
    if isinstance(arg1, str) and isinstance(arg2, str):
        makeCSV(arg1, arg2)
