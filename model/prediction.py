import sys
import pandas as pd
import numpy as np
from sklearn import preprocessing
import seaborn as sn
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import jaccard_score, confusion_matrix, classification_report
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from imblearn.over_sampling import RandomOverSampler
import os
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

#getting the heart rate data

date_to_pull = '2019-03-14'
# Read the CSV file
script_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(script_dir, 'heart-rate-2019-03-14.csv')
heart_df = pd.read_csv(file_path)


heart_df['Time'] = date_to_pull + ' ' + heart_df['Time'] 
heart_df['Time'] = pd.to_datetime(heart_df['Time']) 

# Plot the heart rate data
fig, ax = plt.subplots(figsize=(15, 8))
ax.plot(heart_df['Time'], heart_df['Heart Rate'], label='Heart Rate')

# Calculate and display the average heart rate
average_heart_rate = heart_df['Heart Rate'].mean()
rounded_average_heart_rate = round(float(average_heart_rate))
ax.axhline(y=rounded_average_heart_rate, color='r', linestyle='--', label=f'Average Heart Rate: {rounded_average_heart_rate:.2f}')

# Format the dates on the x-axis
xfmt = mdates.DateFormatter('%d-%m-%y %H:%M')
ax.xaxis.set_major_formatter(xfmt)

# Add a grid to the plot
ax.grid(True)

# Set labels and title
ax.set_xlabel('Time')
ax.set_ylabel('Heart Rate')
ax.set_title('Heart Rate Over Time')

# Display the legend
ax.legend()


file_path = "public/imgs/"

# Get the absolute path
absolute_path = os.path.abspath(file_path)

save_path = os.path.join(absolute_path,"heart-rate-plot")

plt.savefig(save_path)


# ________________________________________________________
#AI model
# Load data
disease_df = pd.read_csv("https://raw.githubusercontent.com/softegy/cap/main/framingham.csv")
disease_df.drop(['education'], inplace=True, axis=1)
disease_df.drop(['totChol'], inplace=True, axis=1)
disease_df.drop(['glucose'], inplace=True, axis=1)
disease_df.rename(columns={'male': 'Sex_male'}, inplace=True)

# removing NaN / NULL values
disease_df.dropna(axis = 0, inplace = True) 

#this is used to delete the missing values and axis = 0 means it will delete the row amd inplace is used to make the changes to the acual dataframe
X = np.asarray(disease_df[['age', 'Sex_male', 'cigsPerDay', 'sysBP', 'diaBP', 'heartRate', 'currentSmoker','BPMeds', 'prevalentStroke', 'prevalentHyp', 'diabetes', 'BMI']])
y = np.asarray(disease_df['TenYearCHD'])

# normalization of the dataset
X = preprocessing.StandardScaler().fit(X).transform(X)

# Handle Class Imbalance using Random Oversampling
ros = RandomOverSampler(random_state=0)
X_resampled, y_resampled = ros.fit_resample(X, y)

# Train-and-Test -Split
X_train, X_test, y_train, y_test = train_test_split(X_resampled, y_resampled, test_size=0.3, random_state=4)

param_grid = {'n_estimators': [50, 100, 150],
              'max_depth': [None, 10, 20],
              'min_samples_split': [2, 5, 10],
              'min_samples_leaf': [1, 2, 4]}

rf = RandomForestClassifier()
grid_search = GridSearchCV(rf, param_grid, cv=2, n_jobs=-1)
grid_search.fit(X_train, y_train)

best_rf = grid_search.best_estimator_
best_rf.fit(X_train, y_train)
score = best_rf.score(X_test, y_test) * 100
# Predictions
y_pred_rf = best_rf.predict(X_test)

new_data = np.array([sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], rounded_average_heart_rate, sys.argv[6], sys.argv[7], sys.argv[8], sys.argv[9], sys.argv[10], sys.argv[11]])
new_data = new_data.reshape(1, -1)  # Reshape for a single sample
new_data = preprocessing.StandardScaler().fit(X).transform(new_data)  # Normalize the new data
prediction = best_rf.predict(new_data)

print(prediction)
print(rounded_average_heart_rate)