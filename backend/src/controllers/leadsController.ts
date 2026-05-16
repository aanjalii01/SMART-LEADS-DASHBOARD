import { Response, NextFunction } from 'express';
import { Parser } from 'json2csv';
import Lead from '../models/Lead';
import { AuthRequest, LeadQueryParams, CreateLeadBody, UpdateLeadBody, LeadStatus, LeadSource } from '../types';

const ITEMS_PER_PAGE = 10;

export const getLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      status,
      source,
      search,
      sort = 'latest',
      page = '1',
      limit = String(ITEMS_PER_PAGE),
    } = req.query as LeadQueryParams;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Role-based: sales users only see their own leads
    if (req.user?.role === 'sales') {
      filter.createdBy = req.user.id;
    }

    const sortOrder = sort === 'oldest' ? 1 : -1;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email'),
      Lead.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: leads,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id).populate('createdBy', 'name email');
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    // Sales users can only view their own leads
    if (req.user?.role === 'sales' && lead.createdBy.toString() !== req.user.id) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, status, source, notes } = req.body as CreateLeadBody;
    const lead = await Lead.create({
      name,
      email,
      status: status || 'New',
      source,
      notes,
      createdBy: req.user?.id,
    });

    res.status(201).json({ success: true, message: 'Lead created successfully.', data: lead });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    // Sales users can only update their own leads
    if (req.user?.role === 'sales' && lead.createdBy.toString() !== req.user.id) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const updates = req.body as UpdateLeadBody;
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.status(200).json({ success: true, message: 'Lead updated successfully.', data: updatedLead });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    // Sales users can only delete their own leads
    if (req.user?.role === 'sales' && lead.createdBy.toString() !== req.user.id) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    await lead.deleteOne();
    res.status(200).json({ success: true, message: 'Lead deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const exportLeadsCSV = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.user?.role === 'sales') filter.createdBy = req.user.id;

    const { status, source, search } = req.query as LeadQueryParams;
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (search?.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .lean();

    const fields = [
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Status', value: 'status' },
      { label: 'Source', value: 'source' },
      { label: 'Notes', value: 'notes' },
      { label: 'Created At', value: (row: Record<string, unknown>) => new Date(row.createdAt as string).toLocaleDateString() },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(leads);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

export const getLeadStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const matchStage: Record<string, unknown> = {};
    if (req.user?.role === 'sales') matchStage.createdBy = req.user.id;

    const [statusStats, sourceStats, totalLeads] = await Promise.all([
      Lead.aggregate([
        { $match: matchStage },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: matchStage },
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]),
      Lead.countDocuments(matchStage),
    ]);

    res.status(200).json({
      success: true,
      data: { totalLeads, statusStats, sourceStats },
    });
  } catch (error) {
    next(error);
  }
};
