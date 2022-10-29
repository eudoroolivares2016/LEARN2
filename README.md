# LEARN²
Front-end for the LEARN² real-time rainfall forecaster

# Purpose
Atmospheric rivers are the main phenomena driving extreme rain events in the Western United States during the rainy season (October-April). Their impacts are near the top of episodic weather events in the West. Accurately forecasting rainfall from these events is critical due to the impacts they have on the water supply as well as the severe flooding risks they pose. The greatest challenge of mitigating the associated impacts is reducing uncertainty in the medium-range forecasts (5-10 days). This is because the most critical decisions are made in this window, from water management in reservoir pool reduction to early flood risk communication and preparation. As such, any tool that both reduces uncertainty and pushes higher confidence to longer lead times is especially valuable. Forecasters are continually looking for insights that might support these critical decisions and another tool in the toolbox could be particularly beneficial, especially if, indeed, equivalent forecast skill is pushed out an additional 1 to 2 days.

The Landfalling Event Atmospheric River Neural Network (LEARN2) is a neural-network-based decision support tool that considers Numerical Weather Prediction (NWP) forecast guidance from NOAA/National Centers for Environmental Prediction (NCEP’s) Global Ensemble Forecast System (GEFS) and the European Center for Medium-Range Weather Forecasting Ensembles (ECMWF), remotely sensed fields, and several subseasonal-to-seasonal teleconnection indices, to produce extreme rainfall predictions. In LEARN2, products are run through both convolutional and fully connected neural networks and a novel “voting” algorithm that leverages the power of ensemble forecast systems to predict whether rainfall will exceed thresholds of interest at discrete points in a grid for lookaheads of up to 10 days. The structure of each neural network is determined for each forecast day via custom genetic algorithms to optimize LEARN2 performance.

Rainfall prediction is known to be a difficult problem. One difficulty is that it rains far less frequently than it doesn’t rain. Though performing a cube root on the rainfall begins to address this problem, it remains the case that the dataset is highly unbalanced. Therefore, simple metrics like accuracy of prediction can distort the reported efficacy of the system. To evaluate the LEARN2 system more fairly and compare it against state-of-the-art NWP models, we use the commonly used F1-score. This score attempts to balance “recall” in which the system can correctly identify all positive cases with “precision” in which the system attempts to avoid “false alarms.” The neural networks are tested and trained on 20 years of historical data, split randomly into 80% training and 20% testing data. These splits are performed multiple times and the F1-score determined on each split to achieve a statistically stable average F1-score for the classification behavior of the neural networks.

LEARN2 is trained on Open Data, including the operational Global Ensemble Forecast System (GEFSv12 with 5 ensemble members) and ECMWF’s (11 ensemble members) reforecasts spanning 2000-2019, using an Amazon Web Services machine with 48 CPUs, 196 GB RAM, 50Gb/s network bandwidth, and 4 NVIDIA Tesla T4 GPUs. LEARN2 is evaluated against the Parameter elevation Regression on Independent Slopes Model (PRISM) gridded precipitation ground truth dataset. This project's results are, in fact, highly promising in delivering additional value in this most critical window. Not surprisingly, the development work has been particularly challenging and has required creative and exhaustive
exploration of the associated forecast space including a variety of input models, AI/ML tools, and model configurations. Using F1-score as our primary metric, LEARN2’s overall network produces predictions that significantly outperform both the GEFS and ECMWF, delivering between one and two additional days of lead time for skillful extreme rainfall prediction when validated on fully independent data (see the below figures). Notably, adding the Pacific/North American (PNA), Arctic Oscillation (AO), North Atlantic Oscillation (NAO), and El Niño/Southern Oscillation (ENSO) teleconnection indices introduces additional and complementary forecast-day-dependent predictive skill to the NWP model forecasts.

# Intended Audience
The Landfalling Event Atmospheric River Neural Network (LEARN2) forecast tool was developed to provided decision makers, including operational meteorologists and hydrologists, with high-confidence predictions of extreme precipitation events, enabling strategic planning and tactical mitigations in advance of landfall. While this tool was developed with atmospheric-river events in mind, the training is generalized for the west-coastal-state domain for all precipitation events, not solely those directly associated with atmospheric rivers.

# Scope
This version of the Users’ Guide describes the LEARN2 tool and how to interact with it to achieve near-real-time forecasts of potential rain events in the western United States for “look-aheads” of 1-10 days.

It does not describe how to maintain the two neural networks and genetic algorithm that are collectively the fundamental basis for the tool—this may be provided in a future version
