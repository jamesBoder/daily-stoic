package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jamesBoder/daily-stoic/internal/repository"
)

type ReadingPlanHandler struct {
	planRepo *repository.ReadingPlanRepository
}

func NewReadingPlanHandler(planRepo *repository.ReadingPlanRepository) *ReadingPlanHandler {
	return &ReadingPlanHandler{planRepo: planRepo}
}

// GET /api/reading-plans
func (h *ReadingPlanHandler) ListPlans(c *gin.Context) {
	plans, err := h.planRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve reading plans"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"reading_plans": plans})
}

// GET /api/reading-plans/:slug
func (h *ReadingPlanHandler) GetPlan(c *gin.Context) {
	slug := c.Param("slug")
	plan, err := h.planRepo.GetBySlug(slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reading plan not found"})
		return
	}

	// Gate premium plan entries for free users
	isPremium, _ := c.Get("isPremium")
	if plan.Tier == "premium" && isPremium != true {
		c.JSON(http.StatusOK, gin.H{
			"gated":         true,
			"tier_required": "lifetime",
			"message":       "This reading plan is available to Practitioner members.",
			"reading_plan": gin.H{
				"id":            plan.ID,
				"slug":          plan.Slug,
				"title":         plan.Title,
				"description":   plan.Description,
				"tier":          plan.Tier,
				"duration_days": plan.DurationDays,
				"tradition":     plan.Tradition,
			},
		})
		return
	}

	// Mask premium quote fields within entries for free users.
	if isPremium != true {
		for i := range plan.Entries {
			if plan.Entries[i].Quote != nil && plan.Entries[i].Quote.Tier == "premium" {
				plan.Entries[i].Quote.Text = ""
				plan.Entries[i].Quote.ContextFull = ""
				plan.Entries[i].Quote.ReflectionPrompt = ""
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"reading_plan": plan})
}

// GET /api/reading-plans/:slug/progress
func (h *ReadingPlanHandler) GetProgress(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	slug := c.Param("slug")

	planID, err := h.planRepo.GetIDBySlug(slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reading plan not found"})
		return
	}

	progress, err := h.planRepo.GetProgress(userID, planID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not retrieve progress"})
		return
	}
	if progress == nil {
		c.JSON(http.StatusOK, gin.H{"progress": nil})
		return
	}
	c.JSON(http.StatusOK, gin.H{"progress": progress})
}

// POST /api/reading-plans/:slug/start
func (h *ReadingPlanHandler) StartPlan(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	slug := c.Param("slug")

	plan, err := h.planRepo.GetBySlug(slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reading plan not found"})
		return
	}

	isPremium, _ := c.Get("isPremium")
	if plan.Tier == "premium" && isPremium != true {
		c.JSON(http.StatusForbidden, gin.H{"error": "Practitioner membership required"})
		return
	}

	progress, err := h.planRepo.StartPlan(userID, plan.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not start plan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"progress": progress})
}

// POST /api/reading-plans/:slug/advance
func (h *ReadingPlanHandler) AdvanceDay(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	slug := c.Param("slug")

	plan, err := h.planRepo.GetBySlug(slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reading plan not found"})
		return
	}

	isPremium, _ := c.Get("isPremium")
	if plan.Tier == "premium" && isPremium != true {
		c.JSON(http.StatusForbidden, gin.H{"error": "Practitioner membership required"})
		return
	}

	progress, err := h.planRepo.AdvanceDay(userID, plan.ID, plan.DurationDays)
	if err != nil {
		if errors.Is(err, repository.ErrPlanNotStarted) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Plan not started — call /start first"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not advance progress"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"progress": progress})
}
