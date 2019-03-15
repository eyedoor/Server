import os
import sys
import face_recognition

eventImage = face_recognition.load_image_file(sys.argv[1])
eventEncodings = face_recognition.face_encodings(eventImage)
numFaces = len(eventEncodings)
prominentEncoding = eventEncodings[0]

imageIDs = []
encodings = []

#load images from user folder
for filename in os.listdir(sys.argv[2]):
    image = face_recognition.load_image_file(sys.argv[2] + "/" + filename)
    encodings.append(face_recognition.face_encodings(image)[0])
    imageIDs.append(filename.split(".",1)[0])

#generate results
results = zip(face_recognition.compare_faces(encodings, prominentEncoding), imageIDs)
results = [int(i[1]) for i in results if i[0] == True]

payload = "{ \"count\" : " + str(numFaces) + ", \"results\" : " + str(results) + "}"

print(payload)
sys.stdout.flush()