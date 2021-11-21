package main

import (
	"net/http"
	"time"

	"github.com/aquilax/go-perlin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	log "github.com/sirupsen/logrus"
)

const address = ":8080"
const updateDelay = 2 * time.Second
const maxBandwidth = 1000000
const constantPercentage = 0.7

var (
	wmBandwidthVaried = promauto.NewGauge(prometheus.GaugeOpts{
		Name:        "wm_bandwidth_data",
		Help:        "Test data for the weathermap plugin.",
		ConstLabels: prometheus.Labels{"type": "varied"},
	})
	wmBandwidthConstant = promauto.NewGauge(prometheus.GaugeOpts{
		Name:        "wm_bandwidth_data",
		Help:        "Test data for the weathermap plugin.",
		ConstLabels: prometheus.Labels{"type": "constant"},
	})
)

func main() {
	log.Info("Starting weathermap testing data exporter")

	p := perlin.NewPerlin(2, 1, 3, 0)

	go func() {
		i := 0
		for {
			val := (p.Noise1D(float64(i)/100) + 0.5) * maxBandwidth

			wmBandwidthVaried.Set(val)
			wmBandwidthConstant.Set(constantPercentage * maxBandwidth)

			i++
			time.Sleep(updateDelay)
		}
	}()

	http.Handle("/metrics", promhttp.Handler())
	log.Infof("Starting exporter: http://%s/metrics", address)
	log.Fatal(http.ListenAndServe(address, nil))
}
