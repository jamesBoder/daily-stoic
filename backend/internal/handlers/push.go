package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jamesBoder/daily-stoic/internal/models"
	"github.com/jamesBoder/daily-stoic/internal/repository"
	"github.com/jamesBoder/daily-stoic/internal/services"
)

type PushHandler struct {
	repo      *repository.PushRepository
	pushSvc   *services.PushService
	publicKey string
}

func NewPushHandler(repo *repository.PushRepository, pushSvc *services.PushService, publicKey string) *PushHandler {
	return &PushHandler{repo: repo, pushSvc: pushSvc, publicKey: publicKey}
}

func (h *PushHandler) GetVAPIDKey(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"public_key": h.publicKey})
}

type subscribeRequest struct {
	Endpoint string `json:"endpoint" binding:"required"`
	Auth     string `json:"auth"     binding:"required"`
	P256DH   string `json:"p256dh"   binding:"required"`
}

func (h *PushHandler) Subscribe(c *gin.Context) {
	userID := c.GetUint("userID")

	var req subscribeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid subscription"})
		return
	}

	sub := &models.PushSubscription{
		UserID:   userID,
		Endpoint: req.Endpoint,
		Auth:     req.Auth,
		P256DH:   req.P256DH,
	}
	if err := h.repo.Upsert(sub); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not save subscription"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"subscribed": true})
}

func (h *PushHandler) Unsubscribe(c *gin.Context) {
	userID := c.GetUint("userID")

	var req struct {
		Endpoint string `json:"endpoint" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "endpoint required"})
		return
	}

	if err := h.repo.DeleteByEndpoint(req.Endpoint, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not remove subscription"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"subscribed": false})
}

func (h *PushHandler) GetStatus(c *gin.Context) {
	userID := c.GetUint("userID")

	var req struct {
		Endpoint string `json:"endpoint"`
	}
	_ = c.ShouldBindJSON(&req)

	if req.Endpoint == "" {
		c.JSON(http.StatusOK, gin.H{"subscribed": false})
		return
	}

	exists, err := h.repo.ExistsByEndpoint(req.Endpoint, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "lookup failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"subscribed": exists})
}
