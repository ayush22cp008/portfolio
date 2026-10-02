# AI-Based Mechanical Part Detection — Project Report (Approved Technical Sections)

> **Source:** 4CP33_PROJECT_22CP008_REPORT.pdf
> **Author:** Ayush (22CP008), BVM Engineering College, GTU
> **Status:** Approved technical portions only, per Node 1 Master Handoff.
> Non-technical sections (title pages, certificates, acknowledgements,
> table of contents, list of figures, list of abbreviations, references) are excluded.

---

## Abstract

ABSTRACT 
 
The rapid growth of industrial automation and mechanical systems has increased the need for 
efficient identification of mechanical components during assembly and maintenance processes. 
However, new or inexperienced engineers often face difficulty in recognizing different 
mechanical parts, especially when multiple similar components are involved. To address this 
problem, this project presents a system for real-time identification of mechanical parts using 
computer vision and deep learning techniques. 
 
The proposed system is capable of detecting and classifying 25 different types of mechanical 
components, including bearings, bolts, nuts, gears, shafts, and other industrial parts. The 
system utilizes a YOLOv8 Nano model trained using segmentation-based annotations to 
identify parts and display their corresponding labels along with confidence scores. The model 
is trained on a custom-built dataset consisting of both synthetic (rendered) images and real-
world images, enabling it to generalize effectively across different environments. 
 
Due to the absence of a comprehensive public dataset, a novel dataset generation approach is 
adopted. Synthetic data is created using 3D CAD models rendered from multiple viewpoints, 
while real-world data is collected from videos and online sources. Advanced techniques such 
as semi-automatic labeling using segmentation models and dataset balancing using feature-
based clustering are employed to improve annotation efficiency and dataset diversity. 
 
The trained model is capable of performing real-time detection and is integrated with a mobile 
application developed using Unity to assist engineers in identifying unknown components. The 
system is optimized for mobile deployment by using a lightweight model and efficient 
processing techniques to ensure smooth real-time performance with minimal latency. 
Experimental results demonstrate that the system performs effectively in real-world 
conditions, although minor limitations such as sensitivity to lighting conditions and partial 
occlusions are observed. This project provides a practical and scalable solution for assisting 
mechanical engineers in part identification and contributes towards the development of 
intelligent industrial support systems.

---

## CHAPTER 1: INTRODUCTION

1 
 
 
CHAPTER 1: INTRODUCTION 
 
1.1 Introduction 
 
The rapid advancement of industrial automation and mechanical systems has significantly 
increased the complexity of machinery used in manufacturing and production environments. 
Mechanical components such as bearings, gears, shafts, bolts, and other industrial parts play a 
crucial role in the functioning of machines. However, identifying these components correctly 
can be challenging, especially for new or inexperienced engineers. In many cases, multiple 
components appear similar in shape and structure, which lead s to confusion during assembly, 
maintenance, and troubleshooting processes. 
 
Traditionally, identification of mechanical parts relies on manual inspection, reference 
manuals, or prior experience. These methods are time-consuming and prone to errors, 
particularly in real-time industrial scenarios where quick decision-making is required. With 
the growth of computer vision and deep learning technologies, it is now possible to automate 
such tasks and improve efficiency and accuracy. 
 
This project proposes a system for real-time identification of mechanical parts using deep 
learning techniques. The system is designed to detect and classify different types of mechanical 
components using a deep learning model trained with segmentation-based annotations. The 
output includes the part name, bounding boxes, and confidence scores, which help engineers 
quickly recognize and utilize the identified components. The system is further integrated into 
a Unity-based application to enable real-time interaction and practical usability. To ensure 
efficient performance on mobile devices, a lightweight YOLOv8 Nano model is used, and the 
system is integrated into a Unity-based mobile application with optimized real-time detection.

---

## 1.2 Motivation

2 
 
 
 
1.2 Motivation 
 
The primary motivation behind this project is to assist mechanical engineers, especially 
beginners, in identifying unknown machine parts efficiently. In industrial environments, 
engineers often encounter situations where they are unfamiliar with specific components, 
which can delay the assembly or repair process. 
 
The lack of a comprehensive and accessible system for automatic part identification inspired 
the development of this solution. Additionally, the absence of publicly available datasets 
covering a wide range of mechanical parts further motivated the creation of a custom dataset 
tailored to this problem. To address this challenge, segmentation-based annotation techniques 
are utilized to generate accurate training data, improving the model’s ability to understand 
object boundaries and shapes. 
 
The integration of artificial intelligence and computer vision into mechanical applications 
provides an opportunity to bridge the gap between theoretical knowledge and practical 
implementation. This project aims to leverage these technologies to build an intelligent and 
user-friendly system for real-time mechanical part identification in real-world environments. 
 
 
1.3 Problem Statement 
 
In industrial and mechanical environments, identifying different mechanical components 
accurately is a critical task. However, due to similarities in shape, size, and appearance among 
various parts, manual identification becomes difficult and inefficient. This problem is more 
significant for new engineers who lack practical experience. 
 
There is a need for an automated system that can: 
• Detect mechanical parts in real-time

---

## Content

3 
 
• Classify them accurately 
• Provide useful information such as labels, bounding boxes, and confidence scores 
Such a system should be capable of working in real-world conditions, including varying 
lighting, backgrounds, and occlusions. Additionally, the system should leverage segmentation-
based understanding of object boundaries to improve detection accuracy and be integrated into 
an interactive application for practical usage. 
 
 
1.4 Objectives 
 
The main objectives of this project are as follows: 
• To develop a system for real-time detection of mechanical parts 
• To classify 25 different types of industrial components 
• To create a custom dataset consisting of synthetic and real-world images 
• To implement automatic and semi-automatic labeling techniques using segmentation-based 
methods 
• To improve model performance using fine-tuning and dataset balancing 
• To integrate the detection system with a Unity-based user interface for real-time interaction 
 
 
1.5 Scope of the Project 
 
The scope of this project includes the development of an intelligent system capable of detecting 
and identifying mechanical parts using deep learning techniques. The system is designed to 
operate on a predefined set of 25 mechanical part classes and provide real-time predictions. 
 
The project focuses on: 
• Dataset creation and preprocessing 
• Model training using segmentation-based annotations and fine-tuning 
• Real-time detection using a camera 
• Displaying results through a Unity-based user interface

---

## 1.6 Organization of the Report

4 
 
However, the system is limited to the selected classes and may face challenges in extreme 
conditions such as poor lighting, heavy occlusion, or highly complex backgrounds. 
 
 
1.6 Organization of the Report 
 
This report is organized as follows: 
• Chapter 1 presents the introduction, motivation, problem statement, and objectives of the 
project. 
• Chapter 2 discusses related work, background, and technologies used. 
• Chapter 3 explains the system design, architecture, and modeling approach. 
• Chapter 4 describes the implementation details, including dataset preparation, model 
training, and Unity application integration. 
• Chapter 5 concludes the project and discusses future scope.

---

## CHAPTER 2 :  RELATED WORK

5 
 
CHAPTER 2 : RELATED WORK 
 
2.1. Introduction 
 
Advancements in computer vision and deep learning have enabled the development of 
intelligent systems capable of recognizing and analyzing visual data. In industrial 
environments, automatic identification of mechanical components can significantly enhance 
efficiency and reduce dependency on manual inspection. This chapter presents an overview of 
existing approaches, fundamental concepts, and key technologies relevant to the proposed 
system. 
 
 
2.2. Related Work 
 
Earlier approaches for identifying objects in images were primarily based on traditional image 
processing techniques such as edge detection, contour analysis, and template matching. These 
approaches were limited in handling variations in object orientation, lighting conditions, and 
complex backgrounds. 
With the emergence of deep learning, modern approaches utilize convolutional neural 
networks for object recognition and localization. Models such as YOLO, Faster R-CNN, and 
SSD have demonstrated significant improvements in both speed and accuracy [8]. Among 
these, YOLO-based architectures are widely preferred for applications requiring real-time 
performance. 
 
In addition to detection techniques, image segmentation methods have been widely explored 
to achieve precise object boundary extraction. Advanced models like the Segment Anything 
Model (SAM) enable efficient generation of segmentation masks, which are useful for 
improving annotation quality and model training [4]. 
 
Several studies have also explored the use of synthetic data generated from 3D models to 
address data scarcity. While synthetic datasets provide controlled and diverse samples, relying

---

## Content

6 
 
solely on them often leads to reduced performance in real-world conditions [2]. Therefore, 
combining synthetic data with real images has become a common practice to enhance model 
robustness [3]. 
 
 
2.3. YOLO-Based Detection Approach 
 
YOLO (You Only Look Once) is a deep learning-based algorithm designed for fast and 
efficient object detection. It processes the entire image in a single pass and predicts multiple 
bounding boxes along with class probabilities [8]. 
 
In the proposed system, the YOLOv8 model is utilized for identifying mechanical components 
in real-time [1]. The model outputs the detected object categories along with bounding boxes 
and confidence scores. Due to its high speed and efficiency, YOLO is well-suited for 
integration into interactive applications such as those developed using Unity. 
 
 
 
2.4. Segmentation-Based Annotation 
 
Accurate annotation is essential for training reliable models. Unlike traditional bounding box 
annotations, segmentation provides pixel-level information about object regions, resulting in 
more precise localization. 
 
In this work, segmentation-based annotations are generated during dataset preparation. 
Techniques involving models such as the Segment Anything Model (SAM) are employed to 
automatically create masks around objects [4]. These masks are then used to enhance the 
training process of the detection model. 
 
Using segmentation information allows the model to better understand object shapes and 
boundaries, leading to improved detection performance in challenging scenarios.

---

## Content

7 
 
 
 
2.5. Dataset Creation and Domain Adaptation 
 
A major challenge encountered in this project is the absence of a comprehensive dataset for 
mechanical components. To overcome this limitation, a custom dataset is developed using both 
synthetic and real-world images. 
 
Synthetic images are produced by rendering 3D CAD models from multiple viewpoints, which 
helps in capturing structural details of components. Real-world images are collected from 
various sources, including videos and online platforms, to introduce environmental variations. 
Models trained exclusively on synthetic data often struggle when applied to real-world inputs 
due to domain differences [2]. To address this issue, both types of data are combined and 
balanced during training, enabling the model to adapt effectively to real-world conditions. 
 
 
 
 
2.6. Dataset Optimization Using Feature Analysis 
 
To improve dataset quality, feature-based techniques are applied to identify and remove 
redundant samples. Deep feature representations are extracted, and similar images are grouped 
using clustering methods [6]. 
 
This approach ensures that the dataset maintains diversity while avoiding unnecessary 
duplication. As a result, the trained model achieves better generalization and improved 
performance.

---

## Content

8 
 
2.7. Real-Time Mobile Deployment and Optimization 
 
The deployment of deep learning models on mobile devices introduces challenges such as 
limited computational resources and real-time performance requirements. To address these 
challenges, lightweight models such as YOLOv8 Nano are used, which provide faster 
inference with reduced computational cost. 
 
In this project, the detection model is integrated into a mobile application developed using 
Unity. Advanced features provided by AR Foundation are utilized to improve performance, 
including efficient camera frame handling, asynchronous processing, and optimized rendering. 
To further reduce latency, the detection pipeline is executed only when the camera feed is 
stable, while normal camera rendering is used during motion. This approach ensures smooth 
user experience and prevents lag during real-time detection. 
 
 
2.8. Tools and Technologies Used 
 
In addition to the core concepts of object detection and segmentation, several tools and 
platforms were explored and utilized during the development of this project. 
Blender is used for generating synthetic data by rendering 3D models of mechanical 
components. The models are rotated and recorded from multiple angles, and frames are 
extracted to create diverse training images. This approach helps in capturing the geometric 
structure of different parts. 
 
Roboflow is used for dataset management, annotation, and model-assisted labeling. It provides 
features such as smart selection tools for segmentation and supports training of small models 
for auto-labeling. This significantly reduces manual effort and improves annotation efficiency. 
TraceParts is used as a source for obtaining 3D CAD models of various mechanical 
components. These models are essential for generating synthetic datasets and include multiple 
variations of industrial parts.

---

## Content

9 
 
Unity is used to develop the application interface for real-time detection. It enables integration 
of the trained model with a camera-based system, allowing users to interact with the application 
easily. 
 
AR Foundation, a Unity package, is utilized to enhance real-time performance and optimize 
camera processing. It provides features such as efficient background rendering, asynchronous 
processing, and hardware-level optimizations, which help in reducing latency and improving 
user experience during detection. 
 
 
2.9. Summary 
 
This chapter presented an overview of existing methods and background concepts related to 
object detection, segmentation, and dataset preparation. The integration of YOLO-based 
detection, segmentation-driven annotation, and optimized dataset construction forms the 
foundation of the proposed system. These techniques, along with the use of a lightweight 
YOLOv8 Nano model and mobile deployment through a Unity-based application, enable 
accurate and efficient identification of mechanical components in real-world scenarios.

---

## CHAPTER 3: MODELING AND DESIGN

10 
 
CHAPTER 3: MODELING AND DESIGN 
 
3.1. System Overview 
 
The proposed system is designed to perform real-time identification of mechanical components 
using deep learning techniques. The system takes input from a camera, processes the image 
using a trained model, and outputs the detected part name along with bounding boxes and 
confidence scores. 
 
The overall system consists of multiple stages, including image acquisition, preprocessing, 
model inference, and result visualization. The trained YOLOv8 Nano model is integrated into 
a Unity-based mobile application, enabling real-time detection using the device camera. 
The system is optimized to ensure smooth performance by controlling when the detection 
pipeline runs, thereby reducing latency and improving user experience. 
 
 
3.2. System Architecture 
 
The architecture of the system consists of the following components: 
 Image Acquisition Module (Camera Input) 
 Preprocessing Module 
 Detection Model (YOLOv8 Nano) 
 Post-processing Module 
 User Interface (Unity Application) 
 
The camera captures real-time frames, which are processed and passed to the detection model. 
The model predicts the class labels, bounding boxes, and confidence scores. The results are 
then displayed on the screen through the Unity interface.

---

## 1. The mobile camera captures real-time video frames.

11 
 
3.3. System Workflow 
 
The workflow of the system can be described as follows: 
1. The mobile camera captures real-time video frames. 
2. Frames are preprocessed and converted into the required input format. 
3. The processed frames are passed to the YOLOv8 Nano model. 
4. The model performs detection and generates outputs. 
5. The results are post-processed and filtered. 
6. The detected objects are displayed with bounding boxes, confidence score and labels. 
 
To improve performance, the detection process is executed only when the camera is stable, 
and it is temporarily paused during motion to avoid unnecessary computation. 
 
 
3.4. Dataset Design 
 
The dataset used in this project is custom-built and consists of both synthetic and real-world 
images. 
 Synthetic images are generated using 3D CAD models rendered in Blender. 
 Real-world images are collected from videos and online sources. 
 
The dataset includes 25 different mechanical component classes, and each class contains 
multiple variations and subtypes. Segmentation-based annotations are used to provide 
accurate object boundaries, which improve model performance. 
 
To ensure diversity, redundant images are removed using feature-based clustering techniques, 
and the dataset is balanced across different classes.

---

## Content

12 
 
3.5. Design Approach 
 
The system design is based on the following key considerations: 
 Use of segmentation-based annotations for better accuracy 
 Combination of synthetic and real-world data for domain adaptation 
 Selection of a lightweight YOLOv8 Nano model for mobile deployment 
 Optimization of real-time detection using AR Foundation features 
 Efficient pipeline execution to reduce latency 
This approach ensures that the system performs well in practical scenarios and can be 
deployed on mobile devices. 
 
 
3.6. Detailed System Architecture Description 
 
 
 
Figure 3.1: System Architecture Diagram

---

## Content

13 
 
 
 
The system architecture of the proposed AI-based mechanical part detection system is shown in 
Figure 3.1. The system is designed as a mobile application developed using Unity, which integrates 
real-time camera input through AR Foundation. The captured frames are passed to the 
preprocessing module, where necessary transformations such as resizing and normalization are 
performed. 
 
A detection control logic is implemented to improve performance by checking camera stability. 
When the camera is stable, frames are passed to the YOLOv8 Nano model trained using 
segmentation-based techniques. If motion is detected, the system temporarily pauses detection to 
reduce unnecessary computation and latency. 
 
The YOLOv8 Nano model used in this system is trained using segmentation techniques, which 
generate pixel-level masks for detected objects. These masks are further processed within the 
system to derive bounding boxes, class labels, and confidence scores. These results are then 
displayed through the user interface, enabling real-time interaction for mechanical engineers. 
 
3.7. Data Flow Diagram (Level 1)
 
Figure 3.2: Data Flow Diagram Level 1

---

## Content

14 
 
Figure 3.2 illustrates the Level 1 Data Flow Diagram of the system. The process begins with 
camera input, where real-time image frames are captured. These frames are passed to the 
preprocessing stage to prepare the data for model inference. 
 
The processed images are then fed into the YOLOv8 Nano model, which performs segmentation-
based detection. The output of the model includes detected components along with their 
corresponding labels and confidence scores. Finally, the processed results are displayed to the user 
through the application interface. 
 
 
3.8. Data Flow Diagram (Level 2)
 
Figure 3.3: Data Flow Diagram Level 2

---

## Content

15 
 
Figure 3.3 presents the Level 2 Data Flow Diagram, which illustrates the detailed internal 
workflow of the proposed system. The process begins with the user capturing a live camera feed 
through the mobile application. This input is continuously monitored to ensure smooth and 
efficient processing. 
 
The system then performs a camera stability check to determine whether the device is stable or in 
motion. This step is important to avoid unnecessary computations and inaccurate predictions 
caused by motion blur. If the camera is detected to be moving, the system temporarily skips the 
detection process, thereby improving performance and reducing processing overhead. 
When the camera is stable, the captured frame is passed to the image preprocessing stage. In this 
stage, operations such as resizing, normalization, and formatting are applied to make the input 
suitable for the deep learning model. The processed image is then forwarded to the YOLOv8 Nano 
model. 
 
The YOLOv8 Nano model, trained using segmentation techniques, performs segmentation-based 
detection by generating pixel-level masks for each identified mechanical component. These masks 
provide more precise localization compared to traditional bounding box detection. 
The generated masks are then passed to the mask processing stage, where relevant object regions 
are refined and filtered. After this, the system performs bounding box generation, where 
rectangular bounding boxes are derived from the segmentation masks for easier visualization and 
interpretation. 
 
Finally, the system produces three key outputs: bounding boxes, class labels, and confidence 
scores. These outputs are combined and displayed on the user interface in real time, allowing users 
to easily identify mechanical components through the mobile application. 
This structured and optimized pipeline ensures efficient computation, reduces unnecessary 
processing during motion, and improves both accuracy and usability in real-world scenarios.

---

## Content

16 
 
3.9. Pipeline for Synthetic (Rendered) Dataset Creation 
 
Figure 3.4: Synthetic Dataset Generation Pipeline

---

## Content

17 
 
Figure 3.4 illustrates the pipeline used for generating the synthetic dataset for mechanical 
component detection. The process begins with collecting 3D mechanical models from the 
TraceParts platform, which provides accurate and detailed CAD models of industrial components. 
These models are imported into Blender, where rendering is performed to simulate realistic visual 
conditions. Video recording is carried out by rotating the models and capturing multiple 
viewpoints, ensuring diversity in orientation, lighting, and perspective. This step helps in 
improving the generalization capability of the model. 
 
From the recorded videos, individual frames are extracted to create a large collection of images. 
These frames are then manually cleaned to remove duplicate, blurred, or irrelevant images, 
ensuring better data quality. The resulting images form the initial synthetic dataset. 
 
The dataset is then annotated using Roboflow, where segmentation-based labeling techniques are 
applied. Tools such as SAM (Segment Anything Model) and YOLO-assisted labeling are used to 
generate accurate pixel-level masks for each object. This approach improves labeling efficiency 
and provides precise object boundaries compared to traditional bounding box annotation. 
 
The annotated dataset is used to train the initial YOLOv8 Nano model using segmentation-based 
learning. This model learns to identify and localize mechanical components based on the generated 
masks. 
 
However, during evaluation on real-world images, performance limitations are observed due to 
domain differences between synthetic and real data. These challenges highlight the need for further 
dataset refinement, balancing, and inclusion of real-world samples to improve robustness and 
accuracy. 
 
This pipeline demonstrates a structured approach to dataset creation, combining synthetic data 
generation, advanced labeling techniques, and iterative model improvement to build an effective 
detection system.

---

## Content

18 
 
3.10. Pipeline for Dataset Enhancement and Final Deployment 
 
Figure 3.5: Dataset Enhancement and Deployment Pipeline

---

## Content

19 
 
Figure 3.5 represents the complete pipeline for dataset enhancement, model optimization, and 
system deployment. This pipeline integrates both synthetic and real-world data to improve the 
performance and robustness of the proposed system. 
 
The process begins with collecting real-world images from online sources such as YouTube and 
other internet platforms. These videos are processed through frame extraction techniques to obtain 
individual images. Filtering is then applied to remove blurred, duplicate, or irrelevant frames, 
ensuring higher data quality. 
 
The extracted images are manually labeled to generate accurate annotations. Unlike synthetic data, 
real-world images often contain complex backgrounds, varying lighting conditions, and 
occlusions, making manual labeling essential for achieving reliable annotations. 
The labeled real-world dataset is then combined with the previously generated synthetic dataset. 
This combination helps in reducing the domain gap between synthetic and real data, thereby 
improving the model’s ability to generalize to real-world scenarios. 
 
To further enhance dataset quality, feature-based clustering using DINOv2 is applied [6]. This step 
groups similar images and removes redundant samples, resulting in a more balanced and diverse 
dataset. Dataset balancing ensures that all classes are well represented and prevents bias during 
training. 
 
The YOLOv8 Nano model is then fine-tuned using this enhanced dataset. Fine-tuning allows the 
model to adapt to real-world variations and improves its accuracy in detecting mechanical 
components. The result is an optimized YOLOv8 Nano model that is lightweight and suitable for 
mobile deployment. 
 
Finally, the trained model is integrated into a Unity-based mobile application. The application 
utilizes the device camera to perform real-time detection of mechanical parts. The system 
processes live input, performs segmentation-based detection, and displays results such as bounding 
boxes, class labels, and confidence scores directly on the screen.

---

## Content

20 
 
This end-to-end pipeline ensures improved detection accuracy, efficient computation, and 
seamless deployment, making the system practical for real-world industrial applications. 
 
During the analysis of model performance on real-world images, a critical challenge known as 
background overfitting was identified. This problem arises when the model learns to associate 
specific background patterns with object classes, rather than focusing on the actual features of the 
objects themselves. In the case of synthetic images, backgrounds are typically clean, uniform, and 
simple, as they are generated from rendered 3D environments. In contrast, real-world images 
contain complex, cluttered, and highly varied backgrounds. This disparity causes the model to 
develop biased representations that perform well on synthetic data but generalize poorly to real-
world scenarios [2]. 
 
To address the problem of background overfitting, a background replacement augmentation 
technique is employed during dataset preparation. In this approach, objects are first isolated from 
their original images using segmentation masks generated during the annotation process. The 
extracted object regions are then pasted onto a diverse set of randomly selected background images 
sourced from different environments. This process generates a new set of composite images in 
which the same object appears across a wide variety of backgrounds, thereby preventing the model 
from developing any association between object identity and background context. 
 
The composite images generated through this augmentation technique constitute the category 
referred to as "Other Images" in the dataset. Out of the total 6,000 images in the dataset, 2,637 
images belong to this category. These images are distributed across the training, validation, and 
test sets as 1,821, 415, and 401 images respectively. By incorporating these augmented samples, 
the model is trained to focus exclusively on the structural and visual features of the mechanical 
components, making it more robust and capable of performing reliably across diverse real-world 
environments. 
 
3.11. Design Challenges and Solutions 
Several challenges were encountered during the development of the system: 
 
Lack of dataset → Solved by creating a custom dataset

---

## Content

21 
 
 
Annotation difficulty → Solved using segmentation and auto-labeling 
 
Domain gap → Solved by combining synthetic and real images 
 
Model performance on mobile → Solved by using YOLOv8 Nano 
 
Real-time lag → Solved using optimized pipeline and AR Foundation

---

## CHAPTER 4: IMPLEMENTATION

22 
 
CHAPTER 4: IMPLEMENTATION 
 
4.1. Introduction 
 
The implementation phase encompasses the practical realization of the system design 
described in the preceding chapters. This phase involves the preparation and augmentation of 
the dataset, configuration of the annotation pipeline, training of the YOLOv8 Nano model 
using segmentation-based techniques, optimization of the dataset through feature-based 
clustering, and the development and integration of the Unity-based mobile application. Each 
stage of the implementation is carried out in a systematic manner to ensure consistency, 
accuracy, and deployability of the final system. 
 
4.2. Dataset Preparation 
 
The dataset used for training, validation, and testing is a custom-built collection comprising 
three distinct categories of images: real-world images, synthetic rendered images, and 
augmented composite images. The total dataset consists of 6,000 images, of which 2,276 are 
real-world images collected from videos and online sources, 1,087 are synthetic images 
rendered using 3D CAD models in Blender, and 2,637 are augmented composite images 
generated through background replacement techniques. The dataset is partitioned into three 
subsets: a training set containing 4,200 images (1,610 real, 769 synthetic, and 1,821 
augmented), a validation set containing 900 images (324 real, 161 synthetic, and 415 
augmented), and a test set containing 900 images (342 real, 157 synthetic, and 401 augmented). 
This structured partitioning ensures that the model is evaluated on data representative of all 
three image categories [1]. 
 
A significant challenge encountered during dataset preparation is the problem of background 
overfitting. This occurs when the model learns to associate background patterns with specific 
object classes rather than learning the inherent visual features of the objects themselves. 
Synthetic images are generated under controlled conditions and typically contain clean, 
uniform backgrounds, whereas real-world images feature complex, cluttered, and diverse

---

## Content

23 
 
environments. This mismatch between the two domains causes the model to overfit to 
background cues, leading to degraded performance when applied to real-world scenarios [2]. 
 
To mitigate the problem of background overfitting, a background replacement augmentation 
technique is applied. In this process, each object is first isolated from its source image using 
the segmentation mask generated during annotation. The extracted object region is 
subsequently pasted onto a randomly selected background image drawn from an independent 
collection of diverse environment images. This process generates new composite images in 
which the object of interest appears against backgrounds that are entirely unrelated to those 
present in the original training samples. By exposing the model to the same objects across a 
wide variety of background contexts, the augmentation technique effectively prevents the 
model from developing spurious background-object associations and encourages learning of 
robust, object-centric features [3]. 
 
 
Figure 4.1: Sample Dataset Images (Synthetic, Real)

---

## Content

24 
 
 
 
 
Figure 4.2: Sample Dataset Images (Augmented using Background Replacement) 
 
 
4.3. Annotation Process 
 
All images in the dataset are annotated using segmentation-based labeling techniques. The 
annotation process is carried out using Roboflow, which provides an integrated platform for 
image management, annotation, and dataset versioning. To improve annotation efficiency, the 
Segment Anything Model (SAM) is employed for semi-automatic mask generation. SAM 
produces pixel-level segmentation masks around detected objects, which are subsequently 
reviewed and refined manually to ensure accuracy. This approach significantly reduces the 
time and effort required for annotation while maintaining high label quality [4].

---

## Content

25 
 
Segmentation-based annotations provide more precise object boundary information compared 
to traditional bounding box annotations. This level of detail enables the model to better 
understand the shape and structure of mechanical components, resulting in improved detection 
performance, particularly in cases involving overlapping or closely placed objects. 
 
 
Figure 4.3: Segmentation-Based Annotation Example 
 
 
4.4. Model Training 
 
The YOLOv8 Nano model is selected for training due to its lightweight architecture and high 
inference speed, which make it well-suited for deployment on mobile devices. The model is 
trained using segmentation-based learning, wherein segmentation masks generated during the 
annotation phase serve as the ground truth for training. The segmentation-based training 
approach enables the model to learn precise object boundaries, which are subsequently used to 
derive bounding boxes during inference [5].

---

## Content

26 
 
Training is conducted over multiple epochs with appropriate learning rate scheduling and data 
augmentation applied during the training pipeline. Standard augmentation techniques such as 
horizontal flipping, brightness variation, and scaling are applied to increase dataset diversity 
and improve model generalization [10]. The training process is monitored using loss metrics 
including box loss, segmentation loss, and classification loss, and the best-performing model 
checkpoint is retained for deployment. 
 
 
Figure 4.4: Training Performance Result 
 
 
4.5. Dataset Optimization 
 
To ensure the quality and diversity of the training data, a feature-based dataset optimization 
step is performed using DINOv2, a self-supervised vision transformer model capable of 
generating rich image feature representations. Deep feature embeddings are extracted from all 
images in the dataset, and k-means clustering is applied to group visually similar images

---

## Content

27 
 
together. Within each cluster, redundant or near-duplicate images are identified and removed, 
ensuring that the dataset maintains a high degree of visual diversity [6]. 
 
The combination of synthetic, real-world, and augmented images, along with the application 
of DINOv2-based clustering, results in a well-balanced and diverse dataset. This approach 
ensures that all mechanical component classes are adequately represented in the training data, 
preventing class imbalance and improving the model’s overall detection accuracy and 
generalization capability. 
 
4.6. Unity Mobile Application Development 
 
The mobile application is developed using Unity, a cross-platform development platform 
widely used for creating interactive real-time applications. Unity is chosen due to its flexibility, 
strong support for native plugin integration, and seamless compatibility with AR Foundation, 
which provides access to device-level camera and sensor functionalities. The project is 
configured specifically for Android deployment, with optimized build settings and player 
configurations to ensure smooth performance on mobile hardware with limited computational 
resources [7]. 
 
The application utilizes AR Foundation to manage the camera feed efficiently. It provides 
features such as real-time background rendering, asynchronous camera frame acquisition, and 
hardware-level optimizations, which are essential for maintaining low latency during real-time 
detection. The captured frames are continuously processed and passed to the detection pipeline 
for inference. 
 
The user interface is designed to be simple, intuitive, and non-intrusive, ensuring that it does 
not obstruct the camera view while still providing essential information. The system displays 
detection results directly on the live camera feed in the form of overlays, including bounding 
boxes, class labels, and confidence scores. The layout is carefully optimized for mobile screen 
dimensions to provide a smooth and user-friendly experience.

---

## Content

28 
 
Additionally, the application incorporates two detection modes to enhance usability. In General 
Detection mode, the system detects multiple mechanical components simultaneously from the 
live camera feed, displaying up to five objects at a time for better visual clarity, even though 
the model is trained on 25 different classes. In Specific Detection mode, the user first selects a 
particular component from a selection interface, after which the system performs detection 
only for the chosen object. This selective detection approach reduces unnecessary predictions 
and improves precision. 
 
This dual-mode interface design allows users to switch between broad and focused detection 
based on their requirements, thereby improving overall efficiency, usability, and real-time 
interaction within the application. 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
Figure 4.5: Unity Mobile Application Interface showing General Detection and Specific 
Detection mode

---

## Content

29 
 
 
4.7. Model Integration and Real-Time Detection 
 
The trained YOLOv8 Nano model is exported in a format compatible with mobile deployment 
and integrated into the Unity application as a native plugin. During runtime, the AR Foundation 
camera captures live frames, which are preprocessed through resizing and normalization 
operations before being passed to the model for inference. The model generates segmentation 
masks for detected objects, which are further processed to extract bounding boxes and 
associated metadata including class labels and confidence scores. The system converts 
segmentation masks into bounding boxes for efficient visualization and real-time display in 
the mobile application. 
 
To optimize real-time performance and reduce unnecessary computation, a stability-based 
detection logic is implemented. This logic monitors the camera motion using sensor data and 
triggers the detection pipeline only when the camera is determined to be stable. When motion 
is detected, the system pauses inference and resumes normal camera rendering, thereby 
avoiding inaccurate predictions caused by motion blur and reducing processing overhead. This 
approach ensures a smooth and responsive user experience during operation. 
 
4.8. System Output 
 
The system generates three primary outputs for each detected mechanical component during 
real-time operation. These outputs are derived from the segmentation-based predictions of the 
YOLOv8 Nano model and are processed for effective visualization. 
 
Bounding boxes are obtained by converting the segmentation masks into rectangular regions 
that enclose the detected objects. Since the model performs segmentation-based detection, it 
first identifies pixel-level object areas, which are then transformed into bounding boxes for 
efficient display. These bounding boxes are overlaid on the live camera feed to indicate object 
location.

---

## Content

30 
 
Class labels are assigned to each detected object based on the model’s classification output. 
These labels correspond to the predefined set of 25 mechanical part classes and are displayed 
alongside the bounding boxes for easy identification. 
 
Confidence scores represent the reliability of each detection and indicate how certain the model 
is about its prediction. These scores are shown together with the class labels, helping users 
assess detection accuracy under varying conditions. 
 
The outputs are displayed in real time on the mobile application. In General Detection mode, 
multiple objects are detected simultaneously, with up to five detections shown at a time for 
better clarity. In Specific Detection mode, only the user-selected component is detected and 
highlighted, improving focus and usability. 
 
 
 
Figure 4.6: Real-Time Detection Output showing General and Specific Detection Results

---

## Content

31 
 
 
 
 
 
 
 
4.9. Results and Observations 
 
The implemented system demonstrates effective real-time performance when tested under 
standard operating conditions. The model successfully identifies and classifies mechanical 
components across a variety of backgrounds and orientations, with stable detections observed 
during normal usage. The inclusion of augmented composite images in the training dataset 
produces a measurable improvement in detection accuracy on real-world images, confirming 
the effectiveness of the background replacement augmentation technique in addressing the 
problem of background overfitting. 
 
Certain limitations are observed during evaluation. Performance degrades under conditions of 
low or highly variable lighting, as the model lacks explicit mechanisms for illumination 
normalization. Partial occlusion of components results in reduced confidence scores and 
occasional missed detections. Motion blur caused by rapid camera movement introduces 
artefacts in the captured frames, which can adversely affect inference quality. These limitations 
are acknowledged as areas for future improvement and are discussed further in the subsequent 
chapter.

---

## CHAPTER 5: CONCLUSION AND FUTURE SCOPE

32 
 
CHAPTER 5: CONCLUSION AND FUTURE SCOPE 
 
5.1. Conclusion 
 
This project presents an AI-based system for real-time identification of mechanical components 
using deep learning techniques. The system successfully detects and classifies various machine 
parts and provides useful outputs such as labels, bounding boxes, and confidence scores. The 
integration with a mobile application enhances its usability, making it helpful for beginners and 
engineers in practical environments. The use of a lightweight model ensures efficient performance 
on mobile devices. Overall, the system demonstrates a practical approach to applying artificial 
intelligence in industrial applications. 
 
5.2. Limitations 
 
The performance of the system depends on the quality and diversity of the dataset, which may 
affect accuracy in complex or unseen scenarios. Additionally, real-time performance may vary on 
low-end devices due to hardware limitations. The model may also face challenges in distinguishing 
visually similar components. Variations in lighting conditions and background complexity can also 
impact detection accuracy. These limitations indicate the need for further improvement in 
robustness. 
 
5.3. Future Scope 
 
The system can be improved by expanding the dataset with more diverse mechanical 
components and enhancing model accuracy and efficiency. Further optimization for real-time 
performance on mobile devices can be implemented. Advanced techniques and cloud-based 
integration can also be explored to improve scalability and usability. The inclusion of more 
advanced augmentation techniques and real-time optimization methods can further enhance 
performance. Additionally, integrating user feedback mechanisms can help improve system 
adaptability over time.

---

## Content

33 
 
References 
 
[1] G. Jocher, A. Chaurasia, and J. Qiu, "Ultralytics YOLOv8," GitHub, 2023. [Online]. Available: 
https://github.com/ultralytics/ultralytics 
 
[2] A. Torralba and A. A. Efros, "Unbiased look at dataset bias," in Proc. IEEE Conf. Computer 
Vision and Pattern Recognition (CVPR), 2011, pp. 1521–1528. 
 
[3] S. R. Richter, V. Vineet, S. Roth, and V. Koltun, "Playing for data: Ground truth from computer 
games," in Proc. European Conf. Computer Vision (ECCV), 2016, pp. 102–118. 
 
[4] A. Kirillov, E. Mintun, N. Ravi, H. Mao, C. Rolland, L. Gustafson, T. Xiao, S. Whitehead, A. 
C. Berg, W.-Y. Lo, P. Dollár, and R. Girshick, "Segment Anything," in Proc. IEEE/CVF Int. Conf. 
Computer Vision (ICCV), 2023, pp. 4015–4026. 
 
[5] G. Jocher, A. Chaurasia, A. Stoken, J. Borovec, Y. Kwon, K. Michael, H. Sahoo, J. Fang, Z. 
Yifu, C. Wong, A. Montes, Z. Wang, C. Fati, J. Nadar, A. Laughing, U. Soneja, and N. Rai, 
"ultralytics/yolov5: v7.0 - YOLOv5 SOTA Realtime Instance Segmentation," Zenodo, 2022. 
 
[6] M. Oquab, T. Darcet, T. Moutakanni, H. V. Vo, M. Szafraniec, V. Khalidov, P. Fernandez, D. 
Haziza, F. Massa, A. El-Nouby, M. Assran, N. Ballas, W. Galuba, R. Howes, P.-Y. Mairal, N. 
Singh, A. Szlam, J. Vedaldi, and P. Bojanowski, "DINOv2: Learning robust visual features without 
supervision," Trans. Machine Learning Research, 2024. 
 
[7] Unity Technologies, "AR Foundation," Unity Documentation, 2023. [Online]. Available: 
https://docs.unity3d.com/Packages/com.unity.xr.arfoundation@5.0/manual/index.html 
 
[8] J. Redmon, S. Divvala, R. Girshick, and A. Farhadi, "You only look once: Unified, real-time 
object detection," in Proc. IEEE Conf. Computer Vision and Pattern Recognition (CVPR), 2016, 
pp. 779–788.

---

## Content

34 
 
[9] T. Y. Lin, M. Maire, S. Belongie, J. Hays, P. Perona, D. Ramanan, P. Dollár, and C. L. Zitnick, 
"Microsoft COCO: Common objects in context," in Proc. European Conf. Computer Vision 
(ECCV), 2014, pp. 740–755. 
 
[10] C. Shorten and T. M. Khoshgoftaar, "A survey on image data augmentation for deep learning," 
J. Big Data, vol. 6, no. 1, pp. 1–48, 2019.

---
