import os
import sys
import face_recognition

eventImage = face_recognition.load_image_file(sys.argv[1])
eventEncodings = face_recognition.face_encodings(eventImage)
numFaces = len(eventEncodings)
#prominentEncoding = eventEncodings[0]

imageIDs = []
encodings = []

#load images from user folder
for filename in os.listdir(sys.argv[2]):
    image = face_recognition.load_image_file(sys.argv[2] + "/" + filename)
    encodings.append(face_recognition.face_encodings(image)[0])
    imageIDs.append(filename.split(".",1)[0])

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