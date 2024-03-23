import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChart, PieChart } from "react-native-gifted-charts";

export default function HomeScreen({ navigation }) {
    const barData = [
        { value: 45, label: 'Pokémon sauvages' },
        { value: 25, label: 'Pokémon capturés' },
        { value: 60, label: 'Badges obtenus' },
        { value: 35, label: 'Pokédollars' },
        { value: 20, label: 'Pokéballs' },
    ];

    const pieData = [
        { value: 60, color: '#FFCB05' },
        { value: 25, color: '#FF0000' },
        { value: 15, color: '#0046BE' },
    ];

    const renderLegendComponent = () => {
        return (
            <View style={styles.legendContainer}>
                <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: '#FFCB05' }]} />
                    <Text style={styles.legendText}>Pokémon sauvages</Text>
                </View>
                <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: '#FF0000' }]} />
                    <Text style={styles.legendText}>Pokémon capturés</Text>
                </View>
                <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: '#0046BE' }]} />
                    <Text style={styles.legendText}>Badges obtenus</Text>
                </View>
            </View>
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Statistiques Pokémon</Text>
                <BarChart
                    data={barData}
                    barWidth={20}
                    spacing={24}
                    roundedTop
                    roundedBottom
                    hideRules
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisTextStyle={{ color: 'gray' }}
                    noOfSections={3}
                    maxValue={100}
                    isAnimated
                />
            </View>
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Répartition des types</Text>
                <PieChart
                    data={pieData}
                    donut
                    showGradient
                    sectionAutoFocus
                    radius={90}
                    innerRadius={60}
                    innerCircleColor={'#232D41'}
                />
                {renderLegendComponent()}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        paddingTop: 30,
    },
    chartContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        marginBottom: 20,
        padding: 20,
        width: '90%',
        alignItems: 'center',
    },
    chartTitle: {
        color: '#6D4C41',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 20,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        marginBottom: 10,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    legendText: {
        color: '#6D4C41',
        fontSize: 14,
    },
});
