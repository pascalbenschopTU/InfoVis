import sys
import pandas as pd

# Taking all indexes of filename1 where the coordinates match filename2
# Return updated csv of filename1
def makeCSV(filename1, filename2):

    df1 = pd.read_csv(filename1)
    df2 = pd.read_csv(filename2)

    a = (df2.reset_index()
        .merge(df1.reset_index(), on=['X'])
        .sort_values('index_x')
        .groupby(['index_x','X'])['index_y']
        .transform('first')
        .unique()
        .tolist()
        )
    new_df = df1.loc[df1.index[a]]

    keep_col = ['X','Y','NUMERIEKEWAARDE', 'WAARNEMINGDATUM']
    
    df = new_df[keep_col]

    df.reset_index(drop=True)
    
    df.to_csv(filename1)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Provide 2 file names!")
        exit()
    arg1 = sys.argv[1]
    arg2 = sys.argv[2]
    if isinstance(arg1, str) and isinstance(arg2, str):
        makeCSV(arg1, arg2)