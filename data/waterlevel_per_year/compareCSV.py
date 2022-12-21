import sys
import pandas as pd

# Compare the values between two years
def makeCSV(filenames : list):
    assert len(filenames) > 3

    column_indexes = []

    df_1 = pd.read_csv(filenames[1])
    df_2 = pd.read_csv(filenames[2])

    year_1 = df_1["WAARNEMINGDATUM"][0]
    year_2 = df_2["WAARNEMINGDATUM"][0]

    column_indexes = ["X", "Y", year_1, year_2]

    df_to_join = df_2[["X", "NUMERIEKEWAARDE"]]
    df_to_join[year_2] = df_to_join["NUMERIEKEWAARDE"]
    df_to_join.set_index(["X"], inplace=True, drop=True)
    df_to_join = df_to_join[[year_2]]
    
    combined_df = df_1.join(df_to_join, on='X')

    for i in range(3, len(filenames)):
        new_df = pd.read_csv(filenames[i])
        new_year = new_df["WAARNEMINGDATUM"][0]
        column_indexes.append(new_year)

        df_to_join = new_df[["X", "NUMERIEKEWAARDE"]]
        df_to_join[new_year] = df_to_join["NUMERIEKEWAARDE"]
        df_to_join.set_index(["X"], inplace=True, drop=True)
        df_to_join = df_to_join[[new_year]]

        combined_df = combined_df.join(df_to_join, on='X')
    
    
    
    combined_df.rename(columns = {'NUMERIEKEWAARDE':year_1}, inplace = True)
    combined_df = combined_df[column_indexes]


    new_filename = "waterlevels.csv"

    print(combined_df)

    combined_df.to_csv(new_filename)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Provide 2 file names!")
        exit()
   
    makeCSV(sys.argv)
