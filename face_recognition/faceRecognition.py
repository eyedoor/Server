import os
import sys
import pickle
import face_recognition

eventImage = face_recognition.load_image_file(sys.argv[1])
eventEncodings = face_recognition.face_encodings(eventImage)
numFaces = len(eventEncodings)
userPath = sys.argv[2]

#load from pickle file
infile = open(userPath + "/encodings.pickle", "rb")
encodingDict = pickle.load(infile)
infile.close()

imageIDs = list(encodingDict.keys())
encodings = list(encodingDict.values())

matches = []

#generate results
for currEncoding in eventEncodings:
    results = zip(face_recognition.compare_faces(encodings, currEncoding), imageIDs)
    results = [int(i[1]) for i in results if i[0] == True]
    if len(results) > 0:
        matches.append(results[0])

payload = "{ \"count\" : " + str(numFaces) + ", \"results\" : " + str(matches) + "}"

print(payload)
sys.stdout.flush()